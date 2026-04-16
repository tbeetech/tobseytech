/**
 * TechCrunch RSS Auto-Blog Syncer
 *
 * Polls the public TechCrunch RSS feed at a configurable interval,
 * uses Gemini AI to rewrite each article into an original blog post,
 * and stores it via the existing blog post storage layer.
 *
 * Posts are created under the admin user "tbeetech" and published
 * automatically. Duplicate detection is slug-based so re-runs are safe.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage.js";
import type { InsertBlogPost } from "../shared/schema.js";

// ─── Configuration ────────────────────────────────────────────────────────────

const TECHCRUNCH_FEED_URL = "https://techcrunch.com/feed/";

/** Maximum characters of article text sent to the AI for rewriting. */
const MAX_ARTICLE_CONTENT_LENGTH = 6000;

/** Delay between consecutive AI calls to respect rate limits (ms). */
const AI_RATE_LIMIT_DELAY_MS = 1500;

/** Delay before the first sync after server startup (ms). */
const INITIAL_SYNC_DELAY_MS = 10_000;

const POLL_INTERVAL_MS = (() => {
  const minutes = parseInt(process.env.TECHCRUNCH_POLL_INTERVAL_MINUTES ?? "30", 10);
  return (Number.isFinite(minutes) && minutes >= 1 ? minutes : 30) * 60 * 1000;
})();

const GEMINI_API_KEY_ENV_VARS = [
  "GEMINI_FLASH_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
] as const;

const GEMINI_TEXT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
] as const;

// ─── State ────────────────────────────────────────────────────────────────────

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let lastSyncAt: Date | null = null;
let lastSyncCount = 0;
let isSyncing = false;

export function getSyncStatus() {
  return {
    running: pollingTimer !== null,
    isSyncing,
    lastSyncAt,
    lastSyncCount,
    pollIntervalMinutes: POLL_INTERVAL_MS / 60_000,
  };
}

// ─── RSS Parsing ──────────────────────────────────────────────────────────────

interface FeedItem {
  title: string;
  link: string;
  description: string; // excerpt / summary from RSS
  content: string; // full encoded content if available
  pubDate: string;
  categories: string[];
  creator: string;
}

/**
 * Lightweight RSS XML parser — avoids adding a dependency.
 * Extracts <item> elements from a TechCrunch RSS feed.
 */
function parseRssItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const tag = (name: string): string => {
      // Handles both <tag>…</tag> and <tag><![CDATA[…]]></tag>
      const re = new RegExp(`<${name}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${name}>`, "i");
      const m = re.exec(block);
      return m ? m[1].trim() : "";
    };

    const categories: string[] = [];
    const catRe = /<category[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/gi;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = catRe.exec(block)) !== null) {
      const cat = catMatch[1].trim();
      if (cat) categories.push(cat);
    }

    items.push({
      title: tag("title"),
      link: tag("link"),
      description: tag("description"),
      content: tag("content:encoded") || tag("description"),
      pubDate: tag("pubDate"),
      categories,
      creator: tag("dc:creator") || "TechCrunch",
    });
  }

  return items;
}

/** Strip HTML tags and decode common entities. */
function stripHtml(html: string): string {
  // Repeatedly strip tags until none remain (handles nested/broken tags)
  let text = html;
  let previous = "";
  while (text !== previous) {
    previous = text;
    text = text.replace(/<[^>]*>/g, "");
  }
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .trim();
}

/** Turn a title into a URL-safe slug. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// ─── AI Rewriting ─────────────────────────────────────────────────────────────

function getGeminiApiKey(): string | null {
  for (const envVar of GEMINI_API_KEY_ENV_VARS) {
    const value = process.env[envVar]?.trim();
    if (value) return value;
  }
  return null;
}

const REWRITE_SYSTEM_PROMPT = `You are a professional tech blog writer for TobseyTech. Your task is to rewrite a TechCrunch news article into a fresh, original blog post. Follow these rules:

1. Rewrite the content in your own words — do NOT copy verbatim.
2. Keep the same key facts, data points, and quotes (attributed properly).
3. Use an engaging, informative tone suitable for a tech-savvy audience.
4. Structure the post with clear paragraphs. Do NOT use markdown headers.
5. The post should be 300–600 words.
6. End with a brief "Why this matters" perspective sentence or two.

Respond ONLY with the rewritten blog post body text. No titles, no headers, no meta commentary.`;

async function rewriteArticle(
  gemini: GoogleGenerativeAI,
  title: string,
  plainTextContent: string,
): Promise<string> {
  const userPrompt = `Original article title: "${title}"\n\nOriginal article content:\n${plainTextContent.slice(0, MAX_ARTICLE_CONTENT_LENGTH)}`;

  for (const modelName of GEMINI_TEXT_MODELS) {
    try {
      const model = gemini.getGenerativeModel({
        model: modelName,
        systemInstruction: REWRITE_SYSTEM_PROMPT,
      });
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      if (text) return text;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/not found/i.test(msg) && /models\//i.test(msg)) continue;
      throw error;
    }
  }

  throw new Error("No Gemini model available for article rewriting.");
}

// ─── Sync Logic ───────────────────────────────────────────────────────────────

/**
 * Fetches the TechCrunch RSS feed, AI-rewrites new articles, and creates
 * blog posts. Returns the number of new posts created.
 */
export async function syncTechCrunchFeed(): Promise<number> {
  if (isSyncing) {
    console.log("[techcrunch] Sync already in progress — skipping.");
    return 0;
  }

  isSyncing = true;
  let created = 0;

  try {
    // 1. Validate Gemini key is available
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.warn("[techcrunch] No Gemini API key configured — cannot rewrite articles. Skipping sync.");
      return 0;
    }
    const gemini = new GoogleGenerativeAI(apiKey);

    // 2. Fetch RSS
    console.log("[techcrunch] Fetching TechCrunch RSS feed…");
    const response = await fetch(TECHCRUNCH_FEED_URL, {
      headers: { "User-Agent": "TobseyTech-BlogSync/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`RSS fetch failed with status ${response.status}`);
    }
    const xml = await response.text();
    const items = parseRssItems(xml);
    console.log(`[techcrunch] Parsed ${items.length} items from feed.`);

    if (items.length === 0) return 0;

    // 3. Resolve admin author
    const admin = await storage.getUserByUsername("tbeetech");
    if (!admin) {
      console.warn('[techcrunch] Admin user "tbeetech" not found — cannot create posts.');
      return 0;
    }
    const authorId = admin.id;
    const authorName = admin.displayName || admin.username;

    // 4. Process each item
    for (const item of items) {
      try {
        const slug = slugify(item.title);
        if (!slug) continue;

        // Skip if slug already exists (idempotent)
        const existing = await storage.getBlogPostBySlug(slug);
        if (existing) continue;

        // Strip HTML for AI input
        const plainContent = stripHtml(item.content || item.description);
        if (plainContent.length < 50) continue; // skip near-empty items

        // AI-rewrite the article
        const rewrittenContent = await rewriteArticle(gemini, item.title, plainContent);

        // Build excerpt from first ~200 chars of rewritten content
        const excerpt =
          rewrittenContent.length > 200
            ? rewrittenContent.slice(0, 197).replace(/\s+\S*$/, "") + "…"
            : rewrittenContent;

        // Pick the best category from TechCrunch categories or default
        const category = item.categories[0] || "Technology";

        // Build tags: "techcrunch" + up to 4 categories
        const tags = [
          "techcrunch",
          ...item.categories.slice(0, 4).map((c) => c.toLowerCase()),
        ].filter((t, i, arr) => arr.indexOf(t) === i); // unique

        const postData: InsertBlogPost = {
          title: item.title,
          slug,
          excerpt,
          content: rewrittenContent,
          coverImage: null,
          tags,
          category,
          published: true,
          authorId,
          authorName,
        };

        await storage.createBlogPost(postData);
        created++;
        console.log(`[techcrunch] Created post: "${item.title}" (${slug})`);

        // Small delay between AI calls to respect rate limits
        await new Promise((r) => setTimeout(r, AI_RATE_LIMIT_DELAY_MS));
      } catch (itemErr) {
        const msg = itemErr instanceof Error ? itemErr.message : String(itemErr);
        console.error(`[techcrunch] Failed to process item "${item.title}":`, msg);
        // Continue with next item
      }
    }

    lastSyncAt = new Date();
    lastSyncCount = created;
    console.log(`[techcrunch] Sync complete — ${created} new post(s) created.`);
    return created;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[techcrunch] Sync failed:", msg);
    return 0;
  } finally {
    isSyncing = false;
  }
}

// ─── Polling Lifecycle ────────────────────────────────────────────────────────

/**
 * Start the periodic TechCrunch feed poller.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function startTechCrunchPoller(): void {
  if (pollingTimer) return;

  const intervalMin = POLL_INTERVAL_MS / 60_000;
  console.log(`[techcrunch] Starting poller (every ${intervalMin} min).`);

  // Run the first sync after a short startup delay so it doesn't block boot
  setTimeout(() => {
    syncTechCrunchFeed().catch((err) => console.error("[techcrunch] Initial sync error:", err));
  }, INITIAL_SYNC_DELAY_MS);

  pollingTimer = setInterval(() => {
    syncTechCrunchFeed().catch((err) => console.error("[techcrunch] Scheduled sync error:", err));
  }, POLL_INTERVAL_MS);
}

/**
 * Stop the periodic poller.
 */
export function stopTechCrunchPoller(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
    console.log("[techcrunch] Poller stopped.");
  }
}
