/**
 * botWorker.ts
 *
 * Background worker bot that automatically fetches articles from trusted tech
 * publishers via their public RSS feeds and posts them to the TobseyTech blog
 * in real-time.
 *
 * Sources: TechCrunch · The Verge · Wired · Ars Technica · Engadget · Android Police
 *
 * Methodology and full documentation: File and Management center/botworker.md
 */

import Parser from "rss-parser";
import { storage } from "./storage.js";
import { cleanPost, decodeHtmlEntities, normalizeTitle } from "./cleaner.js";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BotFeed {
  name: string;
  url: string;
  category: string;
  tags: string[];
}

export interface BotWorkerStatus {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: Date | null;
  postsCreated: number;
  errors: number;
  pollIntervalMs: number;
  maxArticlesPerFeed: number;
  feeds: Array<{ name: string; enabled: boolean; lastFetched: Date | null; articlesFound: number }>;
}

export interface BotConfig {
  pollIntervalMs?: number;
  maxArticlesPerFeed?: number;
  /** Map of feed name → enabled. Only provided keys are updated. */
  feedEnabled?: Record<string, boolean>;
}

// ─── Feed configuration ───────────────────────────────────────────────────────

const TECH_FEEDS: BotFeed[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    category: "Tech Industry",
    tags: ["techcrunch", "startup", "tech-news"],
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    category: "Tech Industry",
    tags: ["the-verge", "consumer-tech", "tech-news"],
  },
  {
    name: "Wired",
    url: "https://www.wired.com/feed/rss",
    category: "Technology & Science",
    tags: ["wired", "science", "tech-news"],
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/index",
    category: "Technology & Science",
    tags: ["ars-technica", "deep-dive", "tech-news"],
  },
  {
    name: "Engadget",
    url: "https://www.engadget.com/rss.xml",
    category: "Consumer Tech",
    tags: ["engadget", "gadgets", "tech-news"],
  },
  {
    name: "Android Police",
    url: "https://www.androidpolice.com/feed/",
    category: "Mobile & Android",
    tags: ["android-police", "android", "mobile"],
  },
];

// Fallback logo URL used when an article has no cover image
const FALLBACK_LOGO_URL = "/og-image.svg";

// How often (ms) the worker polls all feeds — minimum 30 s, default 5 min
const MIN_POLL_INTERVAL_MS = 30_000;
const DEFAULT_POLL_INTERVAL_MS = 300_000;
const _rawPollInterval = parseInt(process.env.BOT_POLL_INTERVAL_MS || String(DEFAULT_POLL_INTERVAL_MS), 10);
const INITIAL_POLL_INTERVAL_MS = Number.isFinite(_rawPollInterval) && _rawPollInterval >= MIN_POLL_INTERVAL_MS
  ? _rawPollInterval
  : DEFAULT_POLL_INTERVAL_MS;

// Maximum articles to process per feed per cycle (1–100, default 5)
const _rawMaxArticles = parseInt(process.env.BOT_MAX_ARTICLES_PER_FEED || "5", 10);
const INITIAL_MAX_ARTICLES = Number.isFinite(_rawMaxArticles) && _rawMaxArticles >= 1
  ? Math.min(_rawMaxArticles, 100)
  : 5;

// ─── Runtime configuration (mutable by admin) ────────────────────────────────

let _pollIntervalMs = INITIAL_POLL_INTERVAL_MS;
let _maxArticlesPerFeed = INITIAL_MAX_ARTICLES;

// Per-feed enabled flags (keyed by feed name)
const _feedEnabled: Record<string, boolean> = Object.fromEntries(
  TECH_FEEDS.map((f) => [f.name, true])
);

// ─── State ────────────────────────────────────────────────────────────────────

const status: BotWorkerStatus = {
  running: false,
  paused: false,
  cycleRunning: false,
  lastRun: null,
  postsCreated: 0,
  errors: 0,
  pollIntervalMs: INITIAL_POLL_INTERVAL_MS,
  maxArticlesPerFeed: INITIAL_MAX_ARTICLES,
  feeds: TECH_FEEDS.map((f) => ({ name: f.name, enabled: true, lastFetched: null, articlesFound: 0 })),
};

// Set of article GUIDs / links already posted this session (+ persisted slugs from DB)
const seenGuids = new Set<string>();

// ─── Title-based duplicate-detection indices ──────────────────────────────────

/**
 * Stop-words excluded from Jaccard token sets so common English filler words
 * don't inflate similarity scores between unrelated titles.
 */
const DEDUP_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "it",
  "its", "this", "that", "as", "how", "why", "what", "when", "where",
  "new", "get", "has", "have", "not", "can", "will", "just", "more",
  "about", "than", "into", "after", "over", "also", "up", "out",
]);

/** Tokenise a title for Jaccard similarity: lower-case significant words only. */
function titleTokens(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(/\s+/)
      .filter((w) => w.length > 2 && !DEDUP_STOP_WORDS.has(w))
  );
}

/**
 * Jaccard similarity coefficient between two token sets (0.0 – 1.0).
 * Returns 1.0 when both sets are empty (both are "nothing"), 0.0 when one is
 * empty and the other is not.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1.0;
  if (a.size === 0 || b.size === 0) return 0.0;
  let intersection = 0;
  const aArr = Array.from(a);
  for (const token of aArr) {
    if (b.has(token)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

/**
 * Minimum Jaccard similarity at which two titles are treated as the same story.
 * 0.65 means 65 % of significant words must overlap.  Tune with
 * `BOT_TITLE_SIMILARITY_THRESHOLD` env var (0.0 – 1.0).
 */
const _rawSimilarityThreshold = parseFloat(
  process.env.BOT_TITLE_SIMILARITY_THRESHOLD || "0.65"
);
const TITLE_SIMILARITY_THRESHOLD =
  Number.isFinite(_rawSimilarityThreshold) &&
  _rawSimilarityThreshold > 0 &&
  _rawSimilarityThreshold <= 1
    ? _rawSimilarityThreshold
    : 0.65;

/**
 * In-memory index of all normalised titles already in the DB (seeded on
 * startup, updated after every successful post).  Used for O(1) exact-title
 * duplicate detection across server restarts.
 */
const seenNormalizedTitles = new Set<string>();

/**
 * Token index for near-duplicate detection.
 * Maps each normalised title to its token set so we can run Jaccard
 * similarity without re-tokenising on every comparison.
 */
const seenTokenIndex = new Map<string, Set<string>>();

let _pollTimer: ReturnType<typeof setTimeout> | null = null;
let _botAdminId: string | null = null;
let _botAdminName = "TobseyTech Bot";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert an article title to a URL-safe slug, ensuring uniqueness with a suffix. */
function toSlug(title: string, suffix: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `${base}-${suffix}`;
}

/** Strip HTML tags from a string to produce plain text. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Build an article excerpt (≤ 300 chars). */
function buildExcerpt(raw: string): string {
  const plain = stripHtml(raw);
  return plain.length > 300 ? plain.slice(0, 297) + "…" : plain || "Read the full article at the source link.";
}

// Extended RSS item type that includes non-standard fields exposed by rss-parser
interface RssItem extends Parser.Item {
  "media:content"?: { $: { url: string } } | Array<{ $: { url: string } }>;
  "content:encoded"?: string;
}

/** Returns true when a cover image URL is a real remote image (not the fallback). */
function hasValidCoverImage(coverImage: string): boolean {
  return Boolean(coverImage) && coverImage !== FALLBACK_LOGO_URL;
}

/**
 * Extract the best available cover image URL from an RSS item.
 * Checks: media:content → enclosure → first <img> in content.
 */
function extractImage(item: RssItem): string {
  // rss-parser exposes media:content as item["media:content"]
  const mediaContent = item["media:content"];
  if (mediaContent && !Array.isArray(mediaContent) && mediaContent.$.url) {
    return mediaContent.$.url;
  }
  if (Array.isArray(mediaContent) && mediaContent[0]?.$.url) {
    return mediaContent[0].$.url;
  }

  // Enclosure (podcasts / images attached to feed)
  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  // Try to find an <img> in the content HTML
  const html = item["content:encoded"] || item.content || "";
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) return imgMatch[1];

  return FALLBACK_LOGO_URL;
}

/**
 * Build the blog post content as plain text, stripping all HTML from the RSS
 * article body so it renders correctly through the Markdown pipeline on the
 * frontend.  The cover image is stored separately in the `coverImage` field
 * and rendered by the frontend, so it is NOT embedded here.
 */
function buildContent(item: RssItem): string {
  const rawHtml =
    item["content:encoded"] ||
    item.content ||
    item.summary ||
    item.contentSnippet ||
    "";

  // Decode HTML entities first, then strip all tags to get clean plain text.
  const body = rawHtml
    ? stripHtml(decodeHtmlEntities(rawHtml))
    : "";

  return body;
}

// ─── Core fetch logic ─────────────────────────────────────────────────────────

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["content:encoded", "content:encoded"],
    ],
  },
  timeout: 15000,
  headers: {
    "User-Agent": "TobseyTechBot/1.0 (https://tobseytech.biz; bot@tobseytech.biz)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

async function fetchAndPostFeed(feed: BotFeed, feedIndex: number): Promise<void> {
  // Skip disabled feeds or when admin is not yet resolved
  if (!_feedEnabled[feed.name] || !_botAdminId) {
    return;
  }

  const adminId = _botAdminId; // captured for this call

  const feedStatus = status.feeds[feedIndex];
  try {
    const parsed = await parser.parseURL(feed.url);
    feedStatus.lastFetched = new Date();
    feedStatus.articlesFound = parsed.items.length;

    let processed = 0;
    for (const item of parsed.items as RssItem[]) {
      if (processed >= _maxArticlesPerFeed) break;

      const guid = item.guid || item.link || item.title || "";
      if (!guid) continue;

      // ── Gate 1: exact GUID match (fast, in-memory) ───────────────────────
      if (seenGuids.has(guid)) continue;

      const title = (item.title || "Untitled").trim();

      // ── Gate 2: exact normalised-title match (survives restarts) ─────────
      const normTitle = normalizeTitle(title);
      if (seenNormalizedTitles.has(normTitle)) {
        seenGuids.add(guid);
        console.log(`[botWorker] ⏭ Skipping exact-title duplicate: "${title}"`);
        continue;
      }

      // ── Gate 3: Jaccard similarity — same story from different sources ────
      const newTokens = titleTokens(title);
      let isSimilar = false;
      const tokenEntries = Array.from(seenTokenIndex.entries());
      for (const [existingNorm, existingTokens] of tokenEntries) {
        if (jaccardSimilarity(newTokens, existingTokens) >= TITLE_SIMILARITY_THRESHOLD) {
          isSimilar = true;
          console.log(
            `[botWorker] ⏭ Skipping near-duplicate: "${title}" ≈ "${existingNorm}" (Jaccard ≥ ${TITLE_SIMILARITY_THRESHOLD})`
          );
          break;
        }
      }
      if (isSimilar) {
        seenGuids.add(guid);
        seenNormalizedTitles.add(normTitle);
        seenTokenIndex.set(normTitle, newTokens);
        continue;
      }

      const slugSuffix = Date.now().toString(36);
      const slug = toSlug(title, slugSuffix);

      const coverImage = extractImage(item);
      const rawExcerpt = buildExcerpt(item.contentSnippet || item.summary || item.content || "");
      const rawContent = buildContent(item);
      const tags = [
        ...feed.tags,
        ...(item.categories ?? []).slice(0, 4).map((c: string) =>
          c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        ),
      ].filter(Boolean);

      // ── Synchronous Gate: clean all text fields before they reach the DB ──
      const cleaned = cleanPost({ title, excerpt: rawExcerpt, content: rawContent });

      await storage.createBlogPost({
        title:   cleaned.title,
        slug,
        excerpt: cleaned.excerpt,
        content: cleaned.content,
        coverImage: hasValidCoverImage(coverImage) ? coverImage : null,
        tags,
        category: feed.category,
        published: true, // auto-publish curated content
        authorId: adminId,
        authorName: `${_botAdminName} · ${feed.name}`,
      });

      // ── Update all dedup indices so subsequent items in this cycle are checked ──
      seenGuids.add(guid);
      seenNormalizedTitles.add(normTitle);
      seenTokenIndex.set(normTitle, newTokens);

      status.postsCreated++;
      processed++;
      console.log(`[botWorker] ✅ Posted: "${title}" (${feed.name})`);
    }
  } catch (err) {
    status.errors++;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[botWorker] ❌ Failed to fetch ${feed.name}: ${msg}`);
  }
}

async function runCycle(): Promise<void> {
  if (!_botAdminId) {
    console.warn("[botWorker] No admin user found — skipping cycle.");
    return;
  }

  // Prevent overlapping cycles: skip if a cycle is already in progress
  if (status.cycleRunning) {
    console.log("[botWorker] Previous cycle still running — skipping this tick.");
    return;
  }

  status.cycleRunning = true;
  status.lastRun = new Date();
  console.log(`[botWorker] 🔄 Starting fetch cycle (${new Date().toISOString()})`);

  try {
    await Promise.allSettled(TECH_FEEDS.map((feed, i) => fetchAndPostFeed(feed, i)));
    console.log(`[botWorker] ✔ Cycle complete. Total posts created: ${status.postsCreated}`);
  } finally {
    status.cycleRunning = false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Resolve the admin user to use as the bot author. */
async function resolveBotAdmin(): Promise<void> {
  try {
    // Prefer the seeded "tbeetech" admin account
    const admin = await storage.getUserByUsername("tbeetech");
    if (admin) {
      _botAdminId = admin.id;
      _botAdminName = admin.displayName || admin.username;
      console.log(`[botWorker] Using admin account "${_botAdminName}" (${_botAdminId})`);
      return;
    }

    // Fallback: any admin user
    const allUsers = await storage.getAllUsers();
    const fallback = allUsers.find((u) => u.role === "admin");
    if (fallback) {
      _botAdminId = fallback.id;
      _botAdminName = fallback.displayName || fallback.username;
      console.log(`[botWorker] Using fallback admin "${_botAdminName}" (${_botAdminId})`);
      return;
    }

    console.warn("[botWorker] No admin user found in storage — bot will not post.");
  } catch (err) {
    console.error("[botWorker] Failed to resolve admin user:", err);
  }
}

/**
 * Seed the in-memory dedup indices from all blog posts currently in the DB.
 *
 * Called once at startup so the Jaccard / exact-title checks survive server
 * restarts and don't re-post articles that were published in a previous
 * session.
 */
async function seedSeenPostsFromDb(): Promise<void> {
  try {
    const posts = await storage.getBlogPosts(false); // all posts, including drafts
    let count = 0;
    for (const post of posts) {
      const norm = normalizeTitle(post.title);
      seenNormalizedTitles.add(norm);
      seenTokenIndex.set(norm, titleTokens(post.title));
      count++;
    }
    console.log(`[botWorker] 📚 Seeded duplicate filter with ${count} existing posts from DB`);
  } catch (err) {
    console.error("[botWorker] Failed to seed duplicate filter from DB:", err);
  }
}

/**
 * Schedule the next cycle tick, clamping the interval to a safe server-controlled
 * range (MIN_POLL_INTERVAL_MS … 24 hours) so that admin-supplied values cannot
 * cause resource-exhaustion via a zero or excessively large timer.
 */
function scheduleNextCycle(fn: () => Promise<void>): void {
  const MAX_POLL_INTERVAL_MS = 86_400_000; // 24 h
  const safeInterval = Math.max(MIN_POLL_INTERVAL_MS, Math.min(MAX_POLL_INTERVAL_MS, _pollIntervalMs));
  _pollTimer = setTimeout(fn, safeInterval);
}

/** Start the background polling loop. */
export async function startBotWorker(): Promise<void> {
  if (status.running && !status.paused) {
    console.log("[botWorker] Already running — skipping start.");
    return;
  }

  await resolveBotAdmin();
  await seedSeenPostsFromDb();
  status.running = true;
  status.paused = false;

  console.log(
    `[botWorker] 🤖 Bot worker started. Poll interval: ${_pollIntervalMs / 1000}s`
  );

  // Use recursive setTimeout so a slow cycle never overlaps with the next tick.
  async function scheduledCycle(): Promise<void> {
    if (!status.running || status.paused) return;
    await runCycle();
    if (status.running && !status.paused) {
      scheduleNextCycle(scheduledCycle);
    }
  }

  // Run an initial cycle immediately, then continue on the schedule
  await runCycle();
  if (status.running && !status.paused) {
    scheduleNextCycle(scheduledCycle);
  }
}

/** Stop the background polling loop permanently (not just paused). */
export function stopBotWorker(): void {
  status.running = false;
  status.paused = false;
  if (_pollTimer) {
    clearTimeout(_pollTimer);
    _pollTimer = null;
  }
  console.log("[botWorker] 🛑 Bot worker stopped.");
}

/** Pause the polling loop (keeps `running` true, stops scheduling new cycles). */
export function pauseBotWorker(): void {
  if (!status.running) {
    console.log("[botWorker] Cannot pause — worker is not running.");
    return;
  }
  status.paused = true;
  if (_pollTimer) {
    clearTimeout(_pollTimer);
    _pollTimer = null;
  }
  console.log("[botWorker] ⏸ Bot worker paused.");
}

/** Resume a paused polling loop. */
export async function resumeBotWorker(): Promise<void> {
  if (!status.paused) {
    console.log("[botWorker] Not paused — nothing to resume.");
    return;
  }
  status.paused = false;
  console.log("[botWorker] ▶ Bot worker resumed.");

  async function scheduledCycle(): Promise<void> {
    if (!status.running || status.paused) return;
    await runCycle();
    if (status.running && !status.paused) {
      scheduleNextCycle(scheduledCycle);
    }
  }

  await runCycle();
  if (status.running && !status.paused) {
    scheduleNextCycle(scheduledCycle);
  }
}

/** Update runtime configuration without restarting the worker. */
export function updateBotConfig(config: BotConfig): void {
  if (config.pollIntervalMs !== undefined) {
    const raw = Number(config.pollIntervalMs);
    // Clamp to [MIN_POLL_INTERVAL_MS, 24 h] — same bounds used in scheduleNextCycle
    if (Number.isFinite(raw) && raw >= MIN_POLL_INTERVAL_MS && raw <= 86_400_000) {
      _pollIntervalMs = raw;
      status.pollIntervalMs = _pollIntervalMs;
      console.log(`[botWorker] ⚙ Poll interval updated to ${_pollIntervalMs / 1000}s`);
    }
  }

  if (config.maxArticlesPerFeed !== undefined) {
    const raw = Number(config.maxArticlesPerFeed);
    if (Number.isFinite(raw)) {
      _maxArticlesPerFeed = Math.max(1, Math.min(100, Math.floor(raw)));
      status.maxArticlesPerFeed = _maxArticlesPerFeed;
      console.log(`[botWorker] ⚙ Max articles per feed updated to ${_maxArticlesPerFeed}`);
    }
  }

  if (config.feedEnabled) {
    for (const [name, enabled] of Object.entries(config.feedEnabled)) {
      if (name in _feedEnabled) {
        _feedEnabled[name] = Boolean(enabled);
        // Sync the status.feeds enabled field too
        const feedEntry = status.feeds.find((f) => f.name === name);
        if (feedEntry) feedEntry.enabled = Boolean(enabled);
        console.log(`[botWorker] ⚙ Feed "${name}" ${enabled ? "enabled" : "disabled"}`);
      }
    }
  }
}

/** Trigger an immediate fetch cycle (used by the manual-trigger API route). */
export async function triggerBotCycle(): Promise<void> {
  await runCycle();
}

/** Return a read-only snapshot of the current bot status. */
export function getBotStatus(): BotWorkerStatus {
  return {
    running: status.running,
    paused: status.paused,
    cycleRunning: status.cycleRunning,
    lastRun: status.lastRun,
    postsCreated: status.postsCreated,
    errors: status.errors,
    pollIntervalMs: _pollIntervalMs,
    maxArticlesPerFeed: _maxArticlesPerFeed,
    feeds: status.feeds.map((f) => ({ ...f })),
  };
}
