/**
 * Vid Aggregator — background worker that scrapes YouTube channel RSS feeds
 * for tech-related video content and creates draft VlogPosts in the database.
 *
 * YouTube exposes per-channel RSS feeds without an API key:
 *   https://www.youtube.com/feeds/videos.xml?channel_id=<CHANNEL_ID>
 */

import { storage } from "./storage.js";

const TECH_CHANNELS: { name: string; channelId: string; enabled: boolean }[] = [
  { name: "Fireship",              channelId: "UCsBjURrPoezykLs9EqgamOA", enabled: true },
  { name: "Traversy Media",        channelId: "UC29ju8bIPH5as8OGnQzwJyA", enabled: true },
  { name: "NetworkChuck",          channelId: "UC9x0AN7BWHpCDHSm9NiJFJQ", enabled: true },
  { name: "Kevin Powell",          channelId: "UCJZv4d5rbIKd4QHMPkcABCw", enabled: true },
  { name: "Tech With Tim",         channelId: "UC4JX40jDee_tINbkjycV4Sg", enabled: true },
  { name: "Linus Tech Tips",       channelId: "UCXuqSBlHAE6Xw-yeJA0Tunw", enabled: true },
  { name: "MKBHD",                 channelId: "UCBcRF18a7Qf58cCRy5xuWwQ", enabled: true },
  { name: "TechLinked",            channelId: "UCeeFfhMcJa1kjtfZAGskOCA", enabled: true },
];

interface ChannelState {
  name: string;
  url: string;
  enabled: boolean;
  lastFetched: string | null;
  videosFound: number;
}

interface VidAggregatorState {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: string | null;
  videosCreated: number;
  errors: number;
  pollIntervalMs: number;
  maxVideosPerChannel: number;
  channels: ChannelState[];
}

const state: VidAggregatorState = {
  running: false,
  paused: false,
  cycleRunning: false,
  lastRun: null,
  videosCreated: 0,
  errors: 0,
  pollIntervalMs: 30 * 60_000,
  maxVideosPerChannel: 5,
  channels: TECH_CHANNELS.map((ch) => ({
    name: ch.name,
    url: `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`,
    enabled: ch.enabled,
    lastFetched: null,
    videosFound: 0,
  })),
};

let intervalHandle: ReturnType<typeof setTimeout> | null = null;

function scheduleNext(): void {
  if (intervalHandle) clearTimeout(intervalHandle);
  // Clamp to prevent resource exhaustion: 1 min – 24 h
  const safeInterval = Math.min(Math.max(state.pollIntervalMs, 60_000), 86_400_000);
  intervalHandle = setTimeout(() => {
    if (state.running && !state.paused) {
      runCycle().catch((err) => console.error("[vid-aggregator] Cycle error:", err));
    }
    scheduleNext();
  }, safeInterval);
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

function parseYouTubeRSS(xml: string): Array<{ videoId: string; title: string; published: string }> {
  const entries: Array<{ videoId: string; title: string; published: string }> = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const entry = m[1];
    const vidMatch   = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
    const pubMatch   = entry.match(/<published>([^<]+)<\/published>/);
    if (vidMatch && titleMatch) {
      entries.push({
        videoId:   vidMatch[1].trim(),
        title:     titleMatch[1].trim(),
        published: pubMatch ? pubMatch[1].trim() : new Date().toISOString(),
      });
    }
  }
  return entries;
}

async function runCycle(): Promise<void> {
  if (state.cycleRunning) return;
  state.cycleRunning = true;
  state.lastRun = new Date().toISOString();

  try {
    const adminUser = await storage.getUserByUsername("admin").catch(() => null);
    const authorId   = adminUser?.id       || "system";
    const authorName = adminUser?.username || "Vid Aggregator";

    const { insertVlogPostSchema } = await import("../shared/schema.js");

    for (const channel of state.channels) {
      if (!channel.enabled) continue;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        let xml = "";
        try {
          const resp = await fetch(channel.url, {
            signal: controller.signal,
            headers: { "User-Agent": "TobseyTech-VidAggregator/1.0" },
          });
          clearTimeout(timeout);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          xml = await resp.text();
        } finally {
          clearTimeout(timeout);
        }

        const entries = parseYouTubeRSS(xml);
        channel.videosFound = entries.length;
        channel.lastFetched = new Date().toISOString();

        let newCount = 0;
        for (const entry of entries.slice(0, state.maxVideosPerChannel)) {
          const embedUrl = `https://www.youtube.com/watch?v=${entry.videoId}`;
          const baseSlug = generateSlug(entry.title);
          const slug     = baseSlug || `video-${entry.videoId}`;

          // Skip if already present
          const existing = await (storage as any).getVlogPostBySlug(slug).catch(() => null);
          if (existing) continue;
          const allVlogs = await (storage as any).getVlogPosts().catch(() => []);
          if (allVlogs.some((v: any) => v.embedUrl.includes(entry.videoId))) continue;

          const description =
            `${entry.title}, aggregated from ${channel.name}. ` +
            `This video covers topics related to developer tools, tech gadgets, and coding insights. ` +
            `Published on ${new Date(entry.published).toLocaleDateString()}.`;

          try {
            const data = insertVlogPostSchema.parse({
              title:       entry.title,
              slug,
              description,
              embedUrl,
              embedPlatform: "YouTube",
              thumbnail:   `https://img.youtube.com/vi/${entry.videoId}/mqdefault.jpg`,
              category:    channel.name,
              tags:        ["tech", "youtube", channel.name.toLowerCase().replace(/[^a-z0-9]/g, "-")],
              published:   process.env.VID_AGGREGATOR_PUBLISH_DRAFTS === "true" ? false : true,
              authorId,
              authorName:  `${authorName} (Vid Aggregator)`,
            });
            await (storage as any).createVlogPost(data);
            newCount++;
            state.videosCreated++;
          } catch (insertErr) {
            console.error(`[vid-aggregator] Insert failed for "${entry.title}":`, insertErr);
          }
        }

        if (newCount > 0) {
          console.log(`[vid-aggregator] ${newCount} new draft(s) from "${channel.name}"`);
        }
      } catch (channelErr) {
        state.errors++;
        console.error(`[vid-aggregator] Error fetching "${channel.name}":`, channelErr);
      }
    }
  } finally {
    state.cycleRunning = false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getVidAggregatorStatus(): VidAggregatorState {
  return { ...state, channels: state.channels.map((c) => ({ ...c })) };
}

export function startVidAggregator(): void {
  if (state.running) return;
  state.running = true;
  state.paused  = false;
  scheduleNext();
  console.log("[vid-aggregator] Started");
}

export function pauseVidAggregator(): void {
  state.paused = true;
  console.log("[vid-aggregator] Paused");
}

export function resumeVidAggregator(): void {
  state.paused = false;
  scheduleNext();
  console.log("[vid-aggregator] Resumed");
}

export function stopVidAggregator(): void {
  state.running = false;
  state.paused  = false;
  if (intervalHandle) { clearTimeout(intervalHandle); intervalHandle = null; }
  console.log("[vid-aggregator] Stopped");
}

export async function triggerVidAggregatorCycle(): Promise<void> {
  await runCycle();
}

export function updateVidAggregatorConfig(cfg: { pollIntervalMs?: number; maxVideosPerChannel?: number }): void {
  if (cfg.pollIntervalMs     !== undefined) state.pollIntervalMs      = Math.min(Math.max(cfg.pollIntervalMs,     60_000),   86_400_000);
  if (cfg.maxVideosPerChannel !== undefined) state.maxVideosPerChannel = Math.min(Math.max(cfg.maxVideosPerChannel, 1), 50);
}
