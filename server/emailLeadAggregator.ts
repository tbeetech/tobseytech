/**
 * emailLeadAggregator.ts
 *
 * Aggregates prospective email leads using a pure Python web-scraping engine.
 *
 * The heavy lifting is done by emailScraper.py (same directory) which uses
 * only standard / open-source Python libraries:
 *   requests, beautifulsoup4, re, urllib, concurrent.futures, xml.etree
 *
 * No third-party API keys are required.  All email discovery is performed
 * by scraping publicly accessible web pages (Google News RSS for domain
 * discovery, then contact/about pages for actual addresses).
 *
 * IMPORTANT: Callers must comply with applicable email-marketing laws
 * (CAN-SPAM, GDPR, etc.) before sending to aggregated addresses.
 */

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execFileAsync = promisify(execFile);

// Resolve the absolute path to emailScraper.py at the same directory level
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRAPER_PATH = path.join(__dirname, "emailScraper.py");

// ─── Public type ─────────────────────────────────────────────────────────────

export interface AggregatedLead {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
}

// ─── Main aggregation function ────────────────────────────────────────────────

/**
 * Aggregates up to `count` prospective email leads for the given industry
 * and optional keyword list by delegating to the Python web-scraping engine.
 *
 * @param industry  Industry/niche label (e.g. "Technology", "Marketing")
 * @param keywords  Additional keyword refinements (e.g. ["email", "B2B"])
 * @param count     Maximum number of leads to return (1 – 500)
 */
export async function aggregateEmailLeads(
  industry: string,
  keywords: string[],
  count: number,
): Promise<AggregatedLead[]> {
  const clampedCount = Math.min(Math.max(1, count), 500);
  const payload = JSON.stringify({ industry, keywords, count: clampedCount });

  let stdout: string;
  try {
    const result = await execFileAsync("python3", [SCRAPER_PATH], {
      input: payload,
      timeout: 90_000,          // 90-second hard ceiling for the scrape job
      maxBuffer: 5 * 1024 * 1024, // 5 MB stdout buffer
    });
    stdout = result.stdout;
  } catch (err: any) {
    // Log the Python-side stderr for diagnosis but never let it surface as 500
    const stderr: string = err?.stderr ?? "";
    console.error("[emailLeadAggregator] Python scraper error:", stderr || err?.message);
    return [];
  }

  // Parse and validate the JSON output from the Python script
  let raw: unknown;
  try {
    raw = JSON.parse(stdout.trim());
  } catch {
    console.error("[emailLeadAggregator] Could not parse Python output:", stdout.slice(0, 200));
    return [];
  }

  if (!Array.isArray(raw)) {
    console.error("[emailLeadAggregator] Unexpected Python output shape:", typeof raw);
    return [];
  }

  // Normalise each item, discarding anything that lacks a valid email
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const leads: AggregatedLead[] = [];
  for (const item of raw as any[]) {
    const email = String(item?.email ?? "").toLowerCase().trim();
    if (!email || !EMAIL_RE.test(email)) continue;
    leads.push({
      email,
      firstName: item.firstName ? String(item.firstName) : undefined,
      lastName:  item.lastName  ? String(item.lastName)  : undefined,
      tags:      Array.isArray(item.tags) ? (item.tags as string[]) : [],
    });
  }

  return leads.slice(0, clampedCount);
}
