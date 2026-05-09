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
  get pollIntervalMs() { return _pollIntervalMs; },
  get maxArticlesPerFeed() { return _maxArticlesPerFeed; },
  feeds: TECH_FEEDS.map((f) => ({ name: f.name, enabled: true, lastFetched: null, articlesFound: 0 })),
};

// Set of article GUIDs / links already posted this session (+ persisted slugs from DB)
const seenGuids = new Set<string>();

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
 * Build the blog post content HTML, including the original article link and
 * the cover image (so the source link is always attached to every post).
 */
function buildContent(
  item: RssItem,
  feedName: string,
  coverImage: string
): string {
  const sourceUrl = item.link || "#";
  const sourceDate = item.pubDate ? new Date(item.pubDate).toDateString() : "";
  const rawContent =
    item["content:encoded"] ||
    item.content ||
    item.summary ||
    item.contentSnippet ||
    "";

  const imageHtml = hasValidCoverImage(coverImage)
    ? `<img src="${coverImage}" alt="Cover image" style="max-width:100%;border-radius:8px;margin-bottom:1.5rem;" />`
    : `<img src="${FALLBACK_LOGO_URL}" alt="TobseyTech" style="max-width:200px;margin-bottom:1.5rem;" />`;

  const sourceHtml = `
<p style="font-size:0.85rem;color:#888;margin-bottom:1.5rem;">
  Originally published by <strong>${feedName}</strong>${sourceDate ? ` on ${sourceDate}` : ""}.
  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Read the original article →</a>
</p>`;

  const body = rawContent
    ? rawContent
    : `<p>Read the full article at the source link below.</p>`;

  const footer = `
<hr style="margin:2rem 0;border-color:#333;" />
<p style="font-size:0.85rem;color:#888;">
  This article was automatically curated from <strong>${feedName}</strong> to keep
  TobseyTech readers up to date with the latest industry news.
  <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">View source →</a>
</p>`;

  return `${imageHtml}${sourceHtml}${body}${footer}`;
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
  // Skip disabled feeds
  if (!_feedEnabled[feed.name]) {
    return;
  }

  const feedStatus = status.feeds[feedIndex];
  try {
    const parsed = await parser.parseURL(feed.url);
    feedStatus.lastFetched = new Date();
    feedStatus.articlesFound = parsed.items.length;

    let processed = 0;
    for (const item of parsed.items as RssItem[]) {
      if (processed >= _maxArticlesPerFeed) break;

      const guid = item.guid || item.link || item.title || "";
      if (!guid || seenGuids.has(guid)) continue;

      const title = (item.title || "Untitled").trim();
      const slugSuffix = Date.now().toString(36);
      const slug = toSlug(title, slugSuffix);

      // Check DB to avoid re-posting across restarts
      const existing = await storage.getBlogPostBySlug(slug);
      if (existing) {
        seenGuids.add(guid);
        continue;
      }

      const coverImage = extractImage(item);
      const excerpt = buildExcerpt(item.contentSnippet || item.summary || item.content || "");
      const content = buildContent(item, feed.name, coverImage);
      const tags = [
        ...feed.tags,
        ...(item.categories ?? []).slice(0, 4).map((c: string) =>
          c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
        ),
      ].filter(Boolean);

      await storage.createBlogPost({
        title,
        slug,
        excerpt,
        content,
        coverImage: hasValidCoverImage(coverImage) ? coverImage : null,
        tags,
        category: feed.category,
        published: true, // auto-publish curated content
        authorId: _botAdminId!,
        authorName: `${_botAdminName} · ${feed.name}`,
      });

      seenGuids.add(guid);
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

/** Start the background polling loop. */
export async function startBotWorker(): Promise<void> {
  if (status.running && !status.paused) {
    console.log("[botWorker] Already running — skipping start.");
    return;
  }

  await resolveBotAdmin();
  status.running = true;
  status.paused = false;

  console.log(
    `[botWorker] 🤖 Bot worker started. Poll interval: ${_pollIntervalMs / 1000}s`
  );

  // Use recursive setTimeout instead of setInterval so a slow cycle never
  // overlaps with the next scheduled one — the next tick is only scheduled
  // AFTER the previous cycle has fully completed.
  async function scheduledCycle(): Promise<void> {
    if (!status.running || status.paused) return;
    await runCycle();
    if (status.running && !status.paused) {
      _pollTimer = setTimeout(scheduledCycle, _pollIntervalMs);
    }
  }

  // Run an initial cycle immediately, then continue on the schedule
  await runCycle();
  if (status.running && !status.paused) {
    _pollTimer = setTimeout(scheduledCycle, _pollIntervalMs);
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
      _pollTimer = setTimeout(scheduledCycle, _pollIntervalMs);
    }
  }

  await runCycle();
  if (status.running && !status.paused) {
    _pollTimer = setTimeout(scheduledCycle, _pollIntervalMs);
  }
}

/** Update runtime configuration without restarting the worker. */
export function updateBotConfig(config: BotConfig): void {
  if (config.pollIntervalMs !== undefined) {
    const v = Number(config.pollIntervalMs);
    if (Number.isFinite(v) && v >= MIN_POLL_INTERVAL_MS) {
      _pollIntervalMs = v;
      console.log(`[botWorker] ⚙ Poll interval updated to ${v / 1000}s`);
    }
  }

  if (config.maxArticlesPerFeed !== undefined) {
    const v = Math.max(1, Math.min(100, Number(config.maxArticlesPerFeed)));
    if (Number.isFinite(v)) {
      _maxArticlesPerFeed = v;
      console.log(`[botWorker] ⚙ Max articles per feed updated to ${v}`);
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
