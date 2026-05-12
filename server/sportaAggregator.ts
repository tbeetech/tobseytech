/**
 * sportaAggregator.ts
 *
 * Aggregates up to 100 postable content items for a SPORTA campaign.
 * Sources: Google News RSS, Medium RSS, Dev.to RSS, Reddit public JSON.
 *
 * Rules per content type:
 *  - Blog articles / tutorials / reviews → only included when they carry an image.
 *  - Social images / memes / quotes      → image + caption; no video links.
 *  - Videos / Shorts / Reels             → source link stored only (no embed / no actual video).
 *  - Podcasts / Threads                  → text + optional image.
 *
 * No external API keys required — all sources are freely accessible.
 */

import Parser from "rss-parser";
import type { SportaCampaign, InsertSportaContent, SportaPlatform, SportaContentType } from "../shared/schema.js";

// ─── RSS parser (shared instance) ────────────────────────────────────────────

interface RssItem extends Parser.Item {
  "media:content"?: { $: { url: string } } | Array<{ $: { url: string } }>;
  "content:encoded"?: string;
  "media:thumbnail"?: { $: { url: string } };
}

const rssParser = new Parser<Record<string, unknown>, RssItem>({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: false }],
      ["content:encoded", "content:encoded"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
  timeout: 12_000,
  headers: {
    "User-Agent": "TobseyTechSPORTA/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

// ─── Industry → search keyword mapping ───────────────────────────────────────

const INDUSTRY_KEYWORDS: Record<string, string> = {
  Fashion: "fashion style trends",
  Cars: "cars automotive vehicles",
  Agriculture: "agriculture farming crops",
  Technology: "technology innovation",
  Crypto: "cryptocurrency bitcoin blockchain",
  Sports: "sports athletes competition",
  Politics: "politics government policy",
  Entertainment: "entertainment celebrities movies",
  Church: "church christian ministry faith",
  Business: "business entrepreneurship startups",
  Ecommerce: "ecommerce online shopping retail",
  "Real Estate": "real estate property housing",
  Motivation: "motivation success mindset",
  Luxury: "luxury lifestyle brands",
  Education: "education learning students",
  Gaming: "gaming video games esports",
  AI: "artificial intelligence machine learning",
  Finance: "finance investing stocks",
  Health: "health wellness fitness",
  Travel: "travel destinations tourism",
  Food: "food recipes cooking",
  Beauty: "beauty skincare makeup",
  Podcasts: "podcasts audio shows",
  News: "breaking news world",
  Custom: "trending news",
};

// ─── Industry → Reddit subreddit mapping ─────────────────────────────────────

const INDUSTRY_SUBREDDITS: Record<string, string[]> = {
  Fashion: ["fashion", "femalefashionadvice"],
  Cars: ["cars", "Autos"],
  Agriculture: ["farming", "agriculture"],
  Technology: ["technology", "gadgets"],
  Crypto: ["CryptoCurrency", "Bitcoin"],
  Sports: ["sports", "nfl"],
  Politics: ["politics", "worldpolitics"],
  Entertainment: ["entertainment", "movies"],
  Church: ["Christianity", "religion"],
  Business: ["business", "Entrepreneur"],
  Ecommerce: ["ecommerce", "dropship"],
  "Real Estate": ["realestate", "RealEstate"],
  Motivation: ["GetMotivated", "motivation"],
  Luxury: ["luxury", "Watches"],
  Education: ["education", "learnprogramming"],
  Gaming: ["gaming", "Games"],
  AI: ["artificial", "MachineLearning"],
  Finance: ["investing", "personalfinance"],
  Health: ["health", "Fitness"],
  Travel: ["travel", "solotravel"],
  Food: ["food", "recipes"],
  Beauty: ["beauty", "SkincareAddiction"],
  Podcasts: ["podcasts", "podcast"],
  News: ["worldnews", "news"],
  Custom: ["all"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

function extractImageFromRssItem(item: RssItem): string | null {
  const mc = item["media:content"];
  if (mc && !Array.isArray(mc) && mc.$.url) return mc.$.url;
  if (Array.isArray(mc) && mc[0]?.$.url) return mc[0].$.url;

  const mt = item["media:thumbnail"];
  if (mt?.$.url) return mt.$.url;

  if (item.enclosure?.url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(item.enclosure.url)) {
    return item.enclosure.url;
  }

  const html = item["content:encoded"] || item.content || "";
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function buildExcerpt(item: RssItem, maxLen = 400): string {
  const raw = item["content:encoded"] || item.content || item.contentSnippet || item.summary || "";
  const text = stripHtml(raw);
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + "…" : text;
}

function containsBannedKeyword(text: string, banned: string[]): boolean {
  if (!banned.length) return false;
  const lower = text.toLowerCase();
  return banned.some((k) => lower.includes(k.toLowerCase()));
}

// ─── Feed URL builders ────────────────────────────────────────────────────────

function googleNewsFeedUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function mediumTagFeedUrl(tag: string): string {
  return `https://medium.com/feed/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, "-"))}`;
}

function devtoTagFeedUrl(tag: string): string {
  return `https://dev.to/feed/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, ""))}`;
}

// ─── Reddit JSON fetcher ──────────────────────────────────────────────────────

interface RedditPost {
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  thumbnail: string;
  author: string;
  is_video: boolean;
  post_hint?: string;
  preview?: { images?: Array<{ source: { url: string } }> };
}

async function fetchRedditPosts(subreddit: string, limit = 25): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
  const resp = await fetch(url, {
    headers: { "User-Agent": "TobseyTechSPORTA/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!resp.ok) return [];
  const json = await resp.json() as any;
  return (json?.data?.children ?? []).map((c: any) => c.data as RedditPost);
}

// ─── Platform → feed list builder ────────────────────────────────────────────

interface FeedDescriptor {
  type: "rss" | "reddit";
  url: string;
  platform: SportaPlatform;
  defaultMediaType: SportaContentType;
}

function buildFeedList(campaign: SportaCampaign): FeedDescriptor[] {
  const { industry, sourcePlatforms, keywords, contentTypes } = campaign;
  const baseKeyword = INDUSTRY_KEYWORDS[industry] ?? industry;
  const searchQuery = keywords.length ? `${baseKeyword} ${keywords.join(" ")}` : baseKeyword;
  const subreddits = INDUSTRY_SUBREDDITS[industry] ?? ["all"];

  const feeds: FeedDescriptor[] = [];

  for (const platform of sourcePlatforms) {
    switch (platform) {
      case "Medium":
        // Medium tag feed — good for articles
        if (contentTypes.some((t) => ["Articles", "Tutorials", "Reviews"].includes(t))) {
          const tag = (keywords[0] ?? industry).toLowerCase().replace(/\s+/g, "-");
          feeds.push({ type: "rss", url: mediumTagFeedUrl(tag), platform: "Medium", defaultMediaType: "Articles" });
        }
        break;

      case "Dev.to":
        if (contentTypes.some((t) => ["Articles", "Tutorials"].includes(t))) {
          const tag = (keywords[0] ?? industry).toLowerCase().replace(/\s+/g, "");
          feeds.push({ type: "rss", url: devtoTagFeedUrl(tag), platform: "Dev.to", defaultMediaType: "Articles" });
        }
        break;

      case "Reddit":
        for (const sub of subreddits.slice(0, 2)) {
          feeds.push({ type: "reddit", url: sub, platform: "Reddit", defaultMediaType: "Images" });
        }
        break;

      case "YouTube":
        // For YouTube we only pull news links, not actual video files
        if (contentTypes.some((t) => ["Videos", "Shorts"].includes(t))) {
          feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} youtube`), platform: "YouTube", defaultMediaType: "Videos" });
        }
        break;

      case "X/Twitter":
        // Pull Google News articles that reference Twitter/X discussions
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} site:x.com OR site:twitter.com`), platform: "X/Twitter", defaultMediaType: "Threads" });
        break;

      case "RSS":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(searchQuery), platform: "RSS", defaultMediaType: "Articles" });
        break;

      case "LinkedIn":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} linkedin`), platform: "LinkedIn", defaultMediaType: "Articles" });
        break;

      case "Pinterest":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} site:pinterest.com`), platform: "Pinterest", defaultMediaType: "Images" });
        break;

      case "TikTok":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} tiktok`), platform: "TikTok", defaultMediaType: "Reels" });
        break;

      case "Instagram":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} instagram`), platform: "Instagram", defaultMediaType: "Images" });
        break;

      case "Threads":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} threads`), platform: "Threads", defaultMediaType: "Threads" });
        break;

      case "Facebook":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(searchQuery), platform: "Facebook", defaultMediaType: "Articles" });
        break;

      case "Telegram":
        feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} telegram`), platform: "Telegram", defaultMediaType: "Articles" });
        break;

      case "Vimeo":
        if (contentTypes.some((t) => ["Videos"].includes(t))) {
          feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} site:vimeo.com`), platform: "Vimeo", defaultMediaType: "Videos" });
        }
        break;

      case "Dailymotion":
        if (contentTypes.some((t) => ["Videos"].includes(t))) {
          feeds.push({ type: "rss", url: googleNewsFeedUrl(`${searchQuery} site:dailymotion.com`), platform: "Dailymotion", defaultMediaType: "Videos" });
        }
        break;

      default:
        feeds.push({ type: "rss", url: googleNewsFeedUrl(searchQuery), platform: platform as SportaPlatform, defaultMediaType: "Articles" });
    }
  }

  // Always include a Google News feed as fallback if nothing else matched
  if (feeds.length === 0) {
    feeds.push({ type: "rss", url: googleNewsFeedUrl(searchQuery), platform: "RSS", defaultMediaType: "Articles" });
  }

  return feeds;
}

// ─── Main aggregation function ────────────────────────────────────────────────

export interface AggregationResult {
  saved: number;
  skipped: number;
  items: InsertSportaContent[];
}

/**
 * Aggregate up to `maxItems` (default 100) postable content items for the
 * given campaign.  Returns the list of InsertSportaContent objects ready to be
 * persisted — the caller is responsible for deduplication and saving.
 */
export async function aggregateCampaignContent(
  campaign: SportaCampaign,
  existingSourceUrls: Set<string>,
  maxItems = 100,
): Promise<AggregationResult> {
  const feeds = buildFeedList(campaign);
  const { bannedKeywords, contentTypes } = campaign;

  const collected: InsertSportaContent[] = [];
  let skipped = 0;

  const isVideoType = (t: SportaContentType) => ["Videos", "Shorts", "Reels"].includes(t);
  const isBlogType = (t: SportaContentType) => ["Articles", "Tutorials", "Reviews"].includes(t);
  const isImageType = (t: SportaContentType) => ["Images", "Memes", "Quotes"].includes(t);

  // Prefer campaign content types; fall back to "Articles"
  const preferredBlogType: SportaContentType = contentTypes.find(isBlogType) ?? "Articles";
  const preferredImageType: SportaContentType = contentTypes.find(isImageType) ?? "Images";
  const preferredVideoType: SportaContentType = contentTypes.find(isVideoType) ?? "Videos";

  const wantsBlogs = contentTypes.some(isBlogType);
  const wantsImages = contentTypes.some(isImageType);
  const wantsVideos = contentTypes.some(isVideoType);
  const wantsThreads = contentTypes.includes("Threads");
  const wantsPodcasts = contentTypes.includes("Podcasts");

  // ── Process each feed concurrently ──
  const feedResults = await Promise.allSettled(
    feeds.map(async (feed) => {
      if (feed.type === "reddit") {
        const posts = await fetchRedditPosts(feed.url, 25);
        const items: InsertSportaContent[] = [];

        for (const post of posts) {
          if (collected.length + items.length >= maxItems) break;

          const postUrl = `https://www.reddit.com${post.permalink}`;
          if (existingSourceUrls.has(postUrl)) { skipped++; continue; }

          const fullText = `${post.title} ${post.selftext}`.toLowerCase();
          if (containsBannedKeyword(fullText, bannedKeywords)) { skipped++; continue; }

          // Skip actual Reddit video posts when image/social type is wanted
          if (post.is_video && !wantsVideos) { skipped++; continue; }

          if (post.is_video && wantsVideos) {
            // Video: store link only
            items.push({
              campaignId: campaign.id,
              sourceUrl: postUrl,
              sourcePlatform: "Reddit",
              originalTitle: post.title,
              originalContent: null as any,
              originalAuthor: post.author,
              originalThumbnail: null,
              mediaType: preferredVideoType,
            });
            continue;
          }

          // For image posts
          const imgUrl = post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&") ?? null;
          const thumb = imgUrl ?? (post.thumbnail && !["self","default","nsfw","spoiler",""].includes(post.thumbnail) ? post.thumbnail : null);

          if (wantsImages || wantsBlogs) {
            // Only include if we have an image
            if (!thumb) { skipped++; continue; }

            items.push({
              campaignId: campaign.id,
              sourceUrl: postUrl,
              sourcePlatform: "Reddit",
              originalTitle: post.title,
              originalContent: post.selftext ? post.selftext.slice(0, 1000) : null,
              originalAuthor: `u/${post.author} on r/${feed.url}`,
              originalThumbnail: thumb,
              mediaType: post.post_hint === "image" ? preferredImageType : preferredBlogType,
            });
          }
        }

        return items;
      }

      // ── RSS feed ──
      const feed_data = await rssParser.parseURL(feed.url);
      const items: InsertSportaContent[] = [];

      for (const item of feed_data.items) {
        if (collected.length + items.length >= maxItems) break;
        if (!item.link) continue;

        if (existingSourceUrls.has(item.link)) { skipped++; continue; }

        const titleAndContent = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();
        if (containsBannedKeyword(titleAndContent, bannedKeywords)) { skipped++; continue; }

        const image = extractImageFromRssItem(item);
        const excerpt = buildExcerpt(item);
        const mediaType: SportaContentType = feed.defaultMediaType as SportaContentType;

        if (isVideoType(mediaType)) {
          // Video: only store link, no content/embed
          if (!wantsVideos) { skipped++; continue; }
          items.push({
            campaignId: campaign.id,
            sourceUrl: item.link,
            sourcePlatform: feed.platform,
            originalTitle: item.title ?? undefined,
            originalContent: undefined,          // no content for video items
            originalAuthor: item.creator ?? undefined,
            originalThumbnail: null,             // no thumbnail for video links
            mediaType: preferredVideoType,
          });
          continue;
        }

        if (isBlogType(mediaType)) {
          if (!wantsBlogs) { skipped++; continue; }
          // Blog posts must have an image
          if (!image) { skipped++; continue; }
          items.push({
            campaignId: campaign.id,
            sourceUrl: item.link,
            sourcePlatform: feed.platform,
            originalTitle: item.title ?? undefined,
            originalContent: excerpt || undefined,
            originalAuthor: item.creator ?? undefined,
            originalThumbnail: image,
            mediaType: preferredBlogType,
          });
          continue;
        }

        if (isImageType(mediaType)) {
          if (!wantsImages) { skipped++; continue; }
          // Image/social posts must have an image
          if (!image) { skipped++; continue; }
          items.push({
            campaignId: campaign.id,
            sourceUrl: item.link,
            sourcePlatform: feed.platform,
            originalTitle: item.title ?? undefined,
            originalContent: excerpt || undefined,
            originalAuthor: item.creator ?? undefined,
            originalThumbnail: image,
            mediaType: preferredImageType,
          });
          continue;
        }

        // Threads / Podcasts / generic
        if (mediaType === "Threads" && !wantsThreads) { skipped++; continue; }
        if (mediaType === "Podcasts" && !wantsPodcasts) { skipped++; continue; }

        items.push({
          campaignId: campaign.id,
          sourceUrl: item.link,
          sourcePlatform: feed.platform,
          originalTitle: item.title ?? undefined,
          originalContent: excerpt || undefined,
          originalAuthor: item.creator ?? undefined,
          originalThumbnail: image ?? null,
          mediaType,
        });
      }

      return items;
    }),
  );

  // Merge all results, respect maxItems and dedup by sourceUrl within this run
  const seenInRun = new Set<string>();
  for (const result of feedResults) {
    if (result.status === "rejected") continue;
    for (const item of result.value) {
      if (collected.length >= maxItems) break;
      if (seenInRun.has(item.sourceUrl)) { skipped++; continue; }
      seenInRun.add(item.sourceUrl);
      collected.push(item);
    }
  }

  return { saved: collected.length, skipped, items: collected };
}
