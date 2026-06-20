/**
 * devTipsBot.ts
 *
 * Daily Dev Tips Bot â€” admin-only background worker that:
 *  1. Rotates through content pillars to avoid feed repetition
 *  2. Uses Gemini AI to generate tip content (caption, thread, hashtags)
 *  3. Generates an SVG code/infographic card (free, zero external deps)
 *  4. Publishes to X (Twitter), LinkedIn, Instagram, and Threads via their APIs
 *  5. Supports configurable posting intervals and format selection
 *
 * All configuration is stored in the DevTipsBotConfig MongoDB document (singleton).
 * Posts are stored in DevTipsPost.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { DevTipsPostModel } from "./models/DevTipsPost.js";
import { DevTipsBotConfigModel } from "./models/DevTipsBotConfig.js";
import {
  DEV_TIPS_PILLARS,
  DEV_TIPS_PILLAR_LABELS,
  type DevTipsPillar,
  type DevTipsFormat,
  type DevTipsPlatform,
  type DevTipsBotConfig,
} from "../shared/schema.js";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DevTipsBotStatus {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  totalGenerated: number;
  totalPublished: number;
  postIntervalMs: number;
  autoPublish: boolean;
  currentPillarIndex: number;
}

// â”€â”€â”€ Runtime state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _timer: NodeJS.Timeout | null = null;
let _cycleRunning = false;
let _lastRun: Date | null = null;
let _nextRun: Date | null = null;

// â”€â”€â”€ Gemini helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getGemini(): { client: GoogleGenerativeAI; key: string } | null {
  const envVars = ["GEMINI_FLASH_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"] as const;
  for (const envVar of envVars) {
    const value = process.env[envVar]?.trim();
    if (value) return { client: new GoogleGenerativeAI(value), key: value };
  }
  return null;
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-001"] as const;

async function generateWithGemini(prompt: string, systemInstruction: string): Promise<string> {
  const geminiConfig = getGemini();
  if (!geminiConfig) throw new Error("No Gemini API key configured");

  let lastError: unknown;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = geminiConfig.client.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (/not found/i.test(msg) && /models\//i.test(msg)) continue;
      throw err;
    }
  }
  throw lastError ?? new Error("All Gemini models exhausted");
}

// â”€â”€â”€ Content prompts by pillar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PILLAR_PROMPTS: Record<DevTipsPillar, string> = {
  "code-snippet":
    "Generate a concise, practical code tip that a developer can apply immediately. Focus on a neat language trick, idiom, or one-liner. Use JavaScript, TypeScript, Python, or Rust. Include a real code example.",
  "architecture":
    "Share an architecture insight, design pattern, or system-design principle. Focus on when to use it and a real-world example. Keep it concrete, not theoretical.",
  "devops":
    "Give a DevOps or CI/CD tip. Cover Docker, GitHub Actions, Kubernetes, Terraform, or shell scripting. Include a short command or YAML snippet where relevant.",
  "performance":
    "Share a performance optimization tip. It could be about profiling, caching, lazy-loading, database indexing, or runtime tuning. Include measurable impact if possible.",
  "security":
    "Share a security best-practice tip for developers. Cover OWASP, auth, encryption, secrets management, or API hardening. Make it actionable.",
  "tool-discovery":
    "Introduce a developer tool, CLI utility, VS Code extension, or open-source library that is underrated or recently released. Explain what problem it solves.",
  "career-mindset":
    "Share an engineering career tip, productivity technique, or developer mindset insight. Make it human and relatable, not generic.",
  "frontend":
    "Share a frontend or CSS tip. Cover modern CSS features, Tailwind tricks, accessibility, web performance, or React/Vue/Svelte patterns. Include a code snippet if helpful.",
  "api-design":
    "Share an API design tip. Cover REST conventions, versioning, error shapes, rate limiting, GraphQL, or gRPC. Keep it practical.",
};

// â”€â”€â”€ SVG card generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PILLAR_COLORS: Record<DevTipsPillar, { bg: string; accent: string; text: string }> = {
  "code-snippet":   { bg: "#0f172a", accent: "#22d3ee", text: "#e2e8f0" },
  "architecture":   { bg: "#0f172a", accent: "#a78bfa", text: "#e2e8f0" },
  "devops":         { bg: "#0f172a", accent: "#34d399", text: "#e2e8f0" },
  "performance":    { bg: "#0f172a", accent: "#fbbf24", text: "#e2e8f0" },
  "security":       { bg: "#0f172a", accent: "#f87171", text: "#e2e8f0" },
  "tool-discovery": { bg: "#0f172a", accent: "#60a5fa", text: "#e2e8f0" },
  "career-mindset": { bg: "#0f172a", accent: "#fb923c", text: "#e2e8f0" },
  "frontend":       { bg: "#0f172a", accent: "#f472b6", text: "#e2e8f0" },
  "api-design":     { bg: "#0f172a", accent: "#4ade80", text: "#e2e8f0" },
};

const PILLAR_ICONS: Record<DevTipsPillar, string> = {
  "code-snippet":   "âš¡",
  "architecture":   "ðŸ—ï¸",
  "devops":         "ðŸ”§",
  "performance":    "ðŸš€",
  "security":       "ðŸ”’",
  "tool-discovery": "ðŸ› ï¸",
  "career-mindset": "ðŸ§ ",
  "frontend":       "ðŸŽ¨",
  "api-design":     "ðŸ”Œ",
};

/** Wrap SVG text at ~charWidth chars per line, returns array of lines. */
function wrapText(text: string, charWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= charWidth) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Escape a string for safe SVG text content. */
function svgText(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateSvgCard(params: {
  pillar: DevTipsPillar;
  title: string;
  caption: string;
  hashtags: string[];
  format: DevTipsFormat;
}): string {
  const { pillar, title, caption, hashtags, format } = params;
  const colors = PILLAR_COLORS[pillar];
  const icon = PILLAR_ICONS[pillar];
  const pillarLabel = DEV_TIPS_PILLAR_LABELS[pillar];

  const W = 1080;
  const H = 1080;
  const PAD = 60;
  const INNER_W = W - PAD * 2;

  // Title wrap
  const titleLines = wrapText(title, 38);
  // Caption wrap
  const captionPreview = caption.slice(0, 280);
  const captionLines = wrapText(captionPreview, 55);
  const hashtagStr = hashtags.slice(0, 6).map((h) => (h.startsWith("#") ? h : `#${h}`)).join("  ");

  const isCodeCard = format === "code-card";

  const titleY = 200;
  const titleLineH = 54;
  const captionY = titleY + titleLines.length * titleLineH + 40;
  const captionLineH = 32;
  const hashtagsY = captionY + Math.min(captionLines.length, 8) * captionLineH + 36;

  const svgTitleLines = titleLines
    .map(
      (line, i) =>
        `<text x="${PAD}" y="${titleY + i * titleLineH}" font-family="'Segoe UI',system-ui,sans-serif" font-size="44" font-weight="700" fill="${colors.text}">${svgText(line)}</text>`
    )
    .join("\n    ");

  const svgCaptionLines = captionLines
    .slice(0, 8)
    .map(
      (line, i) =>
        `<text x="${PAD}" y="${captionY + i * captionLineH}" font-family="'Segoe UI',system-ui,sans-serif" font-size="24" fill="${colors.text}" opacity="0.85">${svgText(line)}</text>`
    )
    .join("\n    ");

  // Code block variant: show a monospace panel
  const codeBlock = isCodeCard
    ? `
    <rect x="${PAD}" y="${captionY}" width="${INNER_W}" height="${Math.min(captionLines.length, 8) * captionLineH + 24}" rx="10" fill="#1e293b" opacity="0.9"/>
    ${captionLines
      .slice(0, 8)
      .map(
        (line, i) =>
          `<text x="${PAD + 16}" y="${captionY + 20 + i * captionLineH}" font-family="'Fira Code','Consolas',monospace" font-size="22" fill="${colors.accent}">${svgText(line)}</text>`
      )
      .join("\n    ")}`
    : svgCaptionLines;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accent-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colors.accent}"/>
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${W}" height="6" fill="${colors.accent}"/>

  <!-- Pillar badge -->
  <rect x="${PAD}" y="44" width="320" height="44" rx="22" fill="${colors.accent}" opacity="0.15"/>
  <text x="${PAD + 20}" y="74" font-family="'Segoe UI',system-ui,sans-serif" font-size="22" font-weight="600" fill="${colors.accent}">${icon}  ${svgText(pillarLabel)}</text>

  <!-- Divider line -->
  <rect x="${PAD}" y="116" width="${INNER_W}" height="2" fill="url(#accent-line)"/>

  <!-- Title -->
  ${svgTitleLines}

  <!-- Caption / Code block -->
  ${codeBlock}

  <!-- Hashtags -->
  <text x="${PAD}" y="${hashtagsY}" font-family="'Segoe UI',system-ui,sans-serif" font-size="20" fill="${colors.accent}" opacity="0.75">${svgText(hashtagStr)}</text>

  <!-- Bottom branding -->
  <text x="${W - PAD}" y="${H - 36}" font-family="'Segoe UI',system-ui,sans-serif" font-size="20" fill="${colors.text}" opacity="0.4" text-anchor="end">ARCOLYTE TECHNOLOGIES Dev Tips</text>
  <text x="${W - PAD}" y="${H - 16}" font-family="'Segoe UI',system-ui,sans-serif" font-size="16" fill="${colors.accent}" opacity="0.5" text-anchor="end">arcolytetech.com</text>
</svg>`;
}

// â”€â”€â”€ HTML infographic card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateHtmlCard(params: {
  pillar: DevTipsPillar;
  title: string;
  caption: string;
  hashtags: string[];
  format: DevTipsFormat;
}): string {
  const { pillar, title, caption, hashtags, format } = params;
  const colors = PILLAR_COLORS[pillar];
  const icon = PILLAR_ICONS[pillar];
  const pillarLabel = DEV_TIPS_PILLAR_LABELS[pillar];
  const hashtagStr = hashtags.slice(0, 8).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  const isCode = format === "code-card";

  const contentBlock = isCode
    ? `<pre style="background:#1e293b;border-radius:10px;padding:20px 24px;overflow-x:auto;font-family:'Fira Code',Consolas,monospace;font-size:15px;color:${colors.accent};line-height:1.6;margin:0 0 20px 0;white-space:pre-wrap;word-break:break-word;">${caption.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`
    : `<p style="font-size:17px;line-height:1.7;color:#cbd5e1;margin:0 0 20px 0;">${caption.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title.replace(/</g, "&lt;")} | ARCOLYTE TECHNOLOGIES Dev Tips</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${colors.bg};font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{background:linear-gradient(135deg,${colors.bg} 0%,#1e293b 100%);border:1px solid ${colors.accent}22;border-radius:20px;max-width:680px;width:100%;padding:40px;box-shadow:0 0 60px ${colors.accent}18,0 20px 60px #00000060;position:relative;overflow:hidden}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:${colors.accent}}
  .badge{display:inline-flex;align-items:center;gap:8px;background:${colors.accent}20;border:1px solid ${colors.accent}40;color:${colors.accent};border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;margin-bottom:24px}
  h2{font-size:26px;font-weight:700;color:#f1f5f9;line-height:1.3;margin-bottom:20px}
  .hashtags{font-size:13px;color:${colors.accent};opacity:0.7;margin-top:4px}
  .footer{margin-top:28px;padding-top:16px;border-top:1px solid #ffffff10;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#94a3b8}
  .footer a{color:${colors.accent};text-decoration:none}
</style>
</head>
<body>
<div class="card">
  <div class="badge"><span>${icon}</span> ${pillarLabel}</div>
  <h2>${title.replace(/</g, "&lt;")}</h2>
  ${contentBlock}
  <div class="hashtags">${hashtagStr}</div>
  <div class="footer">
    <span>ARCOLYTE TECHNOLOGIES Dev Tips</span>
    <a href="https://arcolytetech.com" target="_blank">arcolytetech.com</a>
  </div>
</div>
</body>
</html>`;
}

// â”€â”€â”€ Social media publishers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Post to X (Twitter) via API v2 */
async function publishToTwitter(
  accessToken: string,
  text: string
): Promise<void> {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitter API error ${res.status}: ${body}`);
  }
}

/** Post to LinkedIn via v2 UGC Posts API */
async function publishToLinkedIn(
  accessToken: string,
  accountId: string,
  text: string
): Promise<void> {
  const body = {
    author: `urn:li:person:${accountId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };
  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const b = await res.text();
    throw new Error(`LinkedIn API error ${res.status}: ${b}`);
  }
}

/** Post to Threads via Meta Graph API */
async function publishToThreads(
  accessToken: string,
  accountId: string,
  text: string
): Promise<void> {
  // Step 1: Create container
  const createRes = await fetch(
    `https://graph.threads.net/v1.0/${accountId}/threads?media_type=TEXT&text=${encodeURIComponent(text)}&access_token=${accessToken}`,
    { method: "POST" }
  );
  if (!createRes.ok) {
    const b = await createRes.text();
    throw new Error(`Threads create container error ${createRes.status}: ${b}`);
  }
  const { id: containerId } = await createRes.json() as { id: string };

  // Step 2: Publish container
  const pubRes = await fetch(
    `https://graph.threads.net/v1.0/${accountId}/threads_publish?creation_id=${containerId}&access_token=${accessToken}`,
    { method: "POST" }
  );
  if (!pubRes.ok) {
    const b = await pubRes.text();
    throw new Error(`Threads publish error ${pubRes.status}: ${b}`);
  }
}

/** Post to Instagram via Graph API (requires business/creator account) */
async function publishToInstagram(
  accessToken: string,
  accountId: string,
  text: string
): Promise<void> {
  // Instagram requires an image for feed posts. For text-only we create a
  // caption-only reel/story placeholder. This posts to the Threads-style
  // caption if using Instagram Creator Studio mode.
  // As a fallback: post to a connected Facebook page that mirrors to IG.
  // Full IG feed posts require a hosted image URL â€” post caption to IG Threads instead.
  const createRes = await fetch(
    `https://graph.instagram.com/v21.0/${accountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: text,
        media_type: "REELS",
        access_token: accessToken,
      }),
    }
  );
  if (!createRes.ok) {
    const b = await createRes.text();
    throw new Error(`Instagram media create error ${createRes.status}: ${b}`);
  }
  const { id: mediaId } = await createRes.json() as { id: string };

  const pubRes = await fetch(
    `https://graph.instagram.com/v21.0/${accountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: mediaId, access_token: accessToken }),
    }
  );
  if (!pubRes.ok) {
    const b = await pubRes.text();
    throw new Error(`Instagram publish error ${pubRes.status}: ${b}`);
  }
}

// â”€â”€â”€ Config helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getOrCreateConfig(): Promise<typeof DevTipsBotConfigModel.prototype> {
  let config = await DevTipsBotConfigModel.findOne();
  if (!config) {
    config = new DevTipsBotConfigModel({});
    await config.save();
  }
  return config;
}

// â”€â”€â”€ Pillar selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function selectNextPillar(
  lastIndex: number,
  weights: Map<string, number> | Record<string, number>
): { pillar: DevTipsPillar; nextIndex: number } {
  // Build weighted list from config
  const weightMap: Record<string, number> = weights instanceof Map
    ? Object.fromEntries(weights.entries())
    : weights;

  const pool: DevTipsPillar[] = [];
  for (const pillar of DEV_TIPS_PILLARS) {
    const w = Math.max(1, Math.round(weightMap[pillar] ?? 1));
    for (let i = 0; i < w; i++) pool.push(pillar);
  }

  // Round-robin with offset so we don't repeat consecutive entries
  const nextIndex = (lastIndex + 1) % pool.length;
  return { pillar: pool[nextIndex], nextIndex };
}

// â”€â”€â”€ Format selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function pickFormat(allowed: DevTipsFormat[]): DevTipsFormat {
  if (!allowed.length) return "plain-text";
  return allowed[Math.floor(Math.random() * allowed.length)];
}

// â”€â”€â”€ Core generation cycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function runGenerationCycle(): Promise<{ generated: boolean; postId?: string; error?: string }> {
  if (_cycleRunning) return { generated: false, error: "Cycle already running" };

  _cycleRunning = true;
  try {
    const config = await getOrCreateConfig();

    if (!getGemini()) {
      return { generated: false, error: "No Gemini API key configured" };
    }

    // Pick next pillar
    const { pillar, nextIndex } = selectNextPillar(
      config.lastPillarIndex,
      config.pillarWeights as unknown as Record<string, number>
    );
    const format = pickFormat(config.allowedFormats as DevTipsFormat[]);
    const pillarLabel = DEV_TIPS_PILLAR_LABELS[pillar];

    // Build prompt
    const pillarContext = PILLAR_PROMPTS[pillar];
    const systemInstruction = `You are DevTipsBot, an expert developer content creator for ARCOLYTE TECHNOLOGIES.
You write for ${config.audience} with a ${config.tone} tone.
Keep content precise, technically accurate, and immediately actionable.
Return ONLY valid JSON â€” no markdown fences, no explanation outside the JSON.`;

    const userPrompt = `Create a daily dev tip post for the "${pillarLabel}" content pillar.
Pillar context: ${pillarContext}
Format: ${format}

Return JSON with exactly these keys:
- "title": string (max 120 chars, punchy headline)
- "caption": string (main post text, 200-400 chars for social, include code snippet if ${format === "code-card" || format === "plain-text"})
- "thread": string[] (2-4 follow-up tweets/thread parts, each â‰¤ 280 chars; empty array if not a thread format)
- "hashtags": string[] (6-10 relevant hashtags WITHOUT the # prefix)
- "codeSnippet": string (only if format is "code-card", otherwise empty string â€” the actual code to display on the card)`;

    const raw = await generateWithGemini(userPrompt, systemInstruction);

    // Parse JSON â€” strip potential markdown fences
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    let parsed: {
      title: string;
      caption: string;
      thread: string[];
      hashtags: string[];
      codeSnippet?: string;
    };

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: use raw text as caption
      parsed = {
        title: `${pillarLabel} tip`,
        caption: raw.slice(0, 400),
        thread: [],
        hashtags: ["devtips", "programming", "webdev"],
      };
    }

    // Use codeSnippet as caption content for code cards
    const captionContent =
      format === "code-card" && parsed.codeSnippet
        ? parsed.codeSnippet
        : parsed.caption;

    // Generate visual assets
    const svgCard = generateSvgCard({
      pillar,
      title: parsed.title,
      caption: captionContent,
      hashtags: parsed.hashtags,
      format,
    });

    const htmlCard = generateHtmlCard({
      pillar,
      title: parsed.title,
      caption: captionContent,
      hashtags: parsed.hashtags,
      format,
    });

    // Build full caption with hashtags for social posting
    const hashtagLine = parsed.hashtags
      .slice(0, 8)
      .map((h) => (h.startsWith("#") ? h : `#${h}`))
      .join(" ");
    const fullCaption = `${parsed.caption}\n\n${hashtagLine}`;

    // Save post
    const post = new DevTipsPostModel({
      pillar,
      format,
      title: parsed.title,
      caption: fullCaption,
      thread: parsed.thread ?? [],
      hashtags: parsed.hashtags,
      svgCard,
      htmlCard,
      status: config.autoPublish ? "approved" : "pending",
      platforms: config.defaultPlatforms,
      publishedPlatforms: [],
      generatedBy: "devtips-bot",
    });
    await post.save();

    // Update config counters
    config.lastPillarIndex = nextIndex;
    config.totalGenerated = (config.totalGenerated ?? 0) + 1;
    await config.save();

    _lastRun = new Date();

    // Auto-publish if configured
    if (config.autoPublish) {
      await publishPost(String(post._id));
    }

    return { generated: true, postId: String(post._id) };
  } catch (err) {
    console.error("[devtips-bot] Generation cycle error:", err);
    return {
      generated: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    _cycleRunning = false;
  }
}

// â”€â”€â”€ Publishing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function publishPost(postId: string): Promise<{ published: DevTipsPlatform[]; errors: Partial<Record<DevTipsPlatform, string>> }> {
  const post = await DevTipsPostModel.findById(postId);
  if (!post) throw new Error("Post not found");

  const config = await getOrCreateConfig();
  const accounts = (config.socialAccounts ?? []) as Array<{
    platform: DevTipsPlatform;
    enabled: boolean;
    accessToken?: string;
    refreshToken?: string;
    accountId?: string;
  }>;

  const published: DevTipsPlatform[] = [];
  const errors: Partial<Record<DevTipsPlatform, string>> = {};

  for (const platform of (post.platforms as DevTipsPlatform[])) {
    const account = accounts.find((a) => a.platform === platform && a.enabled);
    if (!account?.accessToken) {
      errors[platform] = `No access token configured for ${platform}`;
      continue;
    }

    try {
      switch (platform) {
        case "twitter":
          await publishToTwitter(account.accessToken, post.caption);
          break;
        case "linkedin":
          if (!account.accountId) throw new Error("LinkedIn accountId required");
          await publishToLinkedIn(account.accessToken, account.accountId, post.caption);
          break;
        case "threads":
          if (!account.accountId) throw new Error("Threads accountId required");
          await publishToThreads(account.accessToken, account.accountId, post.caption);
          break;
        case "instagram":
          if (!account.accountId) throw new Error("Instagram accountId required");
          await publishToInstagram(account.accessToken, account.accountId, post.caption);
          break;
      }
      published.push(platform);
    } catch (err) {
      errors[platform] = err instanceof Error ? err.message : String(err);
    }
  }

  // Update post status
  if (published.length > 0) {
    post.publishedPlatforms = published;
    post.publishedAt = new Date();
    post.status = Object.keys(errors).length === 0 ? "published" : "failed";
    if (Object.keys(errors).length > 0) {
      post.errorLog = JSON.stringify(errors);
    }
    await post.save();

    // Increment config counter
    config.totalPublished = (config.totalPublished ?? 0) + 1;
    await config.save();
  } else {
    post.status = "failed";
    post.errorLog = JSON.stringify(errors);
    await post.save();
  }

  return { published, errors };
}

// â”€â”€â”€ Scheduler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function scheduleNext(intervalMs: number) {
  if (_timer) clearTimeout(_timer);
  _nextRun = new Date(Date.now() + intervalMs);
  _timer = setTimeout(async () => {
    const config = await getOrCreateConfig().catch(() => null);
    if (!config?.running || config?.paused) return;
    await runGenerationCycle();
    scheduleNext(config.postIntervalMs);
  }, intervalMs);
}

export async function startDevTipsBot(): Promise<void> {
  const config = await getOrCreateConfig();
  config.running = true;
  config.paused = false;
  await config.save();
  scheduleNext(config.postIntervalMs);
  console.log(`[devtips-bot] Started â€” interval ${config.postIntervalMs}ms`);
}

export function pauseDevTipsBot(): void {
  if (_timer) { clearTimeout(_timer); _timer = null; }
  _nextRun = null;
  getOrCreateConfig().then((c) => { c.paused = true; c.save(); }).catch(() => {});
  console.log("[devtips-bot] Paused");
}

export async function resumeDevTipsBot(): Promise<void> {
  const config = await getOrCreateConfig();
  config.paused = false;
  await config.save();
  scheduleNext(config.postIntervalMs);
  console.log("[devtips-bot] Resumed");
}

export async function stopDevTipsBot(): Promise<void> {
  if (_timer) { clearTimeout(_timer); _timer = null; }
  _nextRun = null;
  const config = await getOrCreateConfig();
  config.running = false;
  await config.save();
  console.log("[devtips-bot] Stopped");
}

export function getDevTipsBotStatus(): DevTipsBotStatus & { lastRun: Date | null; nextRun: Date | null } {
  return {
    running: false, // will be overwritten by async check
    paused: false,
    cycleRunning: _cycleRunning,
    lastRun: _lastRun,
    nextRun: _nextRun,
    totalGenerated: 0,
    totalPublished: 0,
    postIntervalMs: 24 * 60 * 60 * 1000,
    autoPublish: false,
    currentPillarIndex: -1,
  };
}

export async function getDevTipsBotStatusFull(): Promise<DevTipsBotStatus & { lastRun: Date | null; nextRun: Date | null }> {
  const config = await getOrCreateConfig();
  return {
    running: config.running,
    paused: config.paused,
    cycleRunning: _cycleRunning,
    lastRun: _lastRun,
    nextRun: _nextRun,
    totalGenerated: config.totalGenerated,
    totalPublished: config.totalPublished,
    postIntervalMs: config.postIntervalMs,
    autoPublish: config.autoPublish,
    currentPillarIndex: config.lastPillarIndex,
  };
}
