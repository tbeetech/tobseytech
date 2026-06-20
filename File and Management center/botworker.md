# Arcolyte Technologies Bot Worker — Methodology & Integration Guide

**File:** `server/botWorker.ts`  
**Route folder:** `File and Management center/`  
**Status:** Active — runs automatically on server startup

---

## Purpose

The Bot Worker is a background service integrated into the Arcolyte Technologies server backbone. It automatically fetches the latest tech articles from trusted publishers and publishes them directly to the Arcolyte Technologies blog in real-time, keeping site visitors and registered users up to date with industry news without any manual effort.

---

## Publisher Sources

| Publisher       | RSS Feed URL                                         | Blog Category         |
|-----------------|------------------------------------------------------|-----------------------|
| TechCrunch      | `https://techcrunch.com/feed/`                       | Tech Industry         |
| The Verge       | `https://www.theverge.com/rss/index.xml`             | Tech Industry         |
| Wired           | `https://www.wired.com/feed/rss`                     | Technology & Science  |
| Ars Technica    | `https://feeds.arstechnica.com/arstechnica/index`    | Technology & Science  |
| Engadget        | `https://www.engadget.com/rss.xml`                   | Consumer Tech         |
| Android Police  | `https://www.androidpolice.com/feed/`                | Mobile & Android      |

All sources publish public RSS 2.0 / Atom feeds. No API keys are required to consume them.

---

## Architecture & Methodology

### 1. RSS Polling

The worker uses the `rss-parser` npm package to fetch and parse each publisher's RSS feed. Each feed is fetched concurrently (`Promise.allSettled`) so a slow or unavailable feed does not block the others.

### 2. Real-Time Operation

- **On server startup**, an immediate fetch cycle runs so new posts are available within seconds of the server coming online.
- A **configurable polling interval** (default: **5 minutes**) keeps the blog continuously updated. Set `BOT_POLL_INTERVAL_MS` in environment variables to adjust.
- All six feeds are fetched in parallel on every cycle, minimizing total cycle time.

### 3. Duplicate Prevention

- A **in-memory `Set<string>`** tracks article GUIDs and links processed in the current server session.
- Before inserting, the worker calls `storage.getBlogPostBySlug(slug)` to check the **MongoDB database** for existing slugs, preventing duplicates across server restarts.

### 4. Image & Link Attachment

For every article, the worker extracts the best available image in this priority order:

1. `media:content` RSS field (e.g. TechCrunch, Ars Technica)
2. `enclosure` attachment (RSS standard image field)
3. First `<img>` tag found in the article's HTML content
4. **Fallback: Arcolyte Technologies logo** (`/og-image.svg`) — used when no image is attached

The original article link is **always embedded** in the post body HTML with proper attribution (source name, date, and a "Read the original article →" link).

### 5. Post Content Structure

Each auto-generated blog post contains:

```
[Cover image or Arcolyte Technologies logo]
[Attribution line: "Originally published by <Publisher> on <Date>. Read the original article →"]
[Full article body from RSS feed]
[Footer: "This article was automatically curated from <Publisher>...  View source →"]
```

### 6. Author Attribution

Posts are created under the **`tbeetech` admin account** (seeded at startup). The `authorName` field includes the source publisher name (e.g. `Arcolyte Technologies Bot · TechCrunch`) so editors can identify the origin at a glance.

### 7. Article Volume Control

`BOT_MAX_ARTICLES_PER_FEED` (default: **5**) caps the number of new articles processed per feed per cycle, preventing database flooding on the first run or after a long downtime.

---

## Environment Variables

| Variable                   | Default     | Description                                               |
|----------------------------|-------------|-----------------------------------------------------------|
| `BOT_WORKER_ENABLED`       | `true`      | Set to `"false"` to disable the worker at startup        |
| `BOT_POLL_INTERVAL_MS`     | `300000`    | Milliseconds between polling cycles (default: 5 min)     |
| `BOT_MAX_ARTICLES_PER_FEED`| `5`         | Max articles to process per feed per cycle               |

---

## Admin API Routes

These routes are protected — only users with `role: "admin"` can access them.

### `GET /api/bot/status`

Returns the current bot worker state:

```json
{
  "running": true,
  "lastRun": "2025-05-09T15:30:00.000Z",
  "postsCreated": 42,
  "errors": 0,
  "feeds": [
    { "name": "TechCrunch", "lastFetched": "2025-05-09T15:30:01.000Z", "articlesFound": 10 },
    ...
  ]
}
```

### `POST /api/bot/trigger`

Manually kick off an immediate fetch cycle without waiting for the next scheduled run. Responds instantly while the cycle runs in the background:

```json
{ "ok": true, "message": "Bot fetch cycle triggered." }
```

---

## Data Flow Diagram

```
Server Startup
     │
     ├─► ensureAdminUser()       ← resolve bot author ID
     └─► startBotWorker()
              │
              ├─ Immediate cycle ─────────────────────────────────────────┐
              └─ setInterval (every 5 min) ─────────────────────────────┐ │
                                                                         ▼ ▼
                                          fetchAndPostFeed() × 6 (parallel)
                                                    │
                                          rss-parser.parseURL(feed.url)
                                                    │
                                          For each new article:
                                            ├─ extractImage()       → cover image / logo fallback
                                            ├─ buildExcerpt()       → 300-char plain-text excerpt
                                            ├─ buildContent()       → HTML with image + source link
                                            └─ storage.createBlogPost() → MongoDB (published: true)
                                                    │
                                          Blog post visible at /blog immediately
```

---

## Security Considerations

- The bot uses **read-only public RSS feeds** — no credentials or API keys are sent to third parties.
- The admin `triggerBotCycle` and `getBotStatus` API endpoints are gated behind `requireAdmin` middleware.
- No user-supplied data enters the DB unsanitized: all fields are derived from parsed RSS items and validated through the existing `createBlogPost` storage interface.
- The bot respects the existing **rate limiter** infrastructure on API routes.

---

## Disabling the Bot

Set `BOT_WORKER_ENABLED=false` in your environment variables and restart the server. No bot cycles will run. Individual articles can still be created manually via the blog editor.

---

*Maintained by Arcolyte Technologies Engineering | arcolytetech.com*
