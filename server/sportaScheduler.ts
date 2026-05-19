/**
 * sportaScheduler.ts
 *
 * Background scheduler that automatically runs content aggregation for all
 * SPORTA campaigns with status "active".  The scheduler respects the
 * campaign's postingFrequency preference to determine how often to re-aggregate.
 *
 * Frequency → interval mapping:
 *   "Every 30 minutes" → 30 min
 *   "Hourly"           → 60 min
 *   "Every 3 hours"    → 3 h
 *   "Every 6 hours"    → 6 h
 *   "Twice daily"      → 12 h
 *   "Daily"            → 24 h
 *   "Weekly"           → 168 h
 *
 * The scheduler wakes up every 15 minutes to check which campaigns are due
 * for a new aggregation cycle; this avoids spinning up hundreds of
 * independent timers.
 */

import type { SportaCampaign, InsertSportaContent } from "../shared/schema.js";
import { storage } from "./storage.js";

const FREQUENCY_MS: Record<string, number> = {
  "Every 30 minutes": 30 * 60_000,
  "Hourly":           60 * 60_000,
  "Every 3 hours":     3 * 60 * 60_000,
  "Every 6 hours":     6 * 60 * 60_000,
  "Twice daily":      12 * 60 * 60_000,
  "Daily":            24 * 60 * 60_000,
  "Weekly":          168 * 60 * 60_000,
};

const DEFAULT_INTERVAL_MS = 60 * 60_000; // 1 hour default

// Track when each campaign was last auto-aggregated (in-memory; resets on restart)
const lastAggregated = new Map<string, number>();

let schedulerHandle: ReturnType<typeof setTimeout> | null = null;
let running = false;

async function runSchedulerCycle(): Promise<void> {
  try {
    const allCampaigns: SportaCampaign[] = await (storage as any).getSportaCampaigns();
    const activeCampaigns = allCampaigns.filter((c) => c.status === "active");

    if (activeCampaigns.length === 0) return;

    const { aggregateCampaignContent } = await import("./sportaAggregator.js");
    const now = Date.now();

    for (const campaign of activeCampaigns) {
      const intervalMs =
        FREQUENCY_MS[campaign.postingFrequency ?? ""] ?? DEFAULT_INTERVAL_MS;
      const lastRun = lastAggregated.get(campaign.id) ?? 0;

      if (now - lastRun < intervalMs) continue; // not due yet

      // Mark as running to avoid overlapping cycles for the same campaign
      lastAggregated.set(campaign.id, now);

      try {
        const existing: any[] = await (storage as any).getSportaContentByCampaign(campaign.id);
        const existingUrls = new Set<string>(existing.map((i: any) => i.sourceUrl));

        const result = await aggregateCampaignContent(campaign, existingUrls, 100);

        let savedCount = 0;
        for (const item of result.items) {
          try {
            await (storage as any).createSportaContent(item);
            savedCount++;
          } catch (saveErr: any) {
            if (saveErr?.code !== 11000) {
              console.warn("[sporta-scheduler] save error:", saveErr?.message ?? saveErr);
            }
          }
        }

        if (savedCount > 0) {
          await (storage as any).updateSportaCampaign(campaign.id, {
            postsAggregated: (campaign.postsAggregated ?? 0) + savedCount,
          });
          console.log(
            `[sporta-scheduler] Auto-aggregated ${savedCount} items for campaign "${campaign.name}" (${campaign.id})`,
          );
        }
      } catch (err) {
        console.error(`[sporta-scheduler] Failed to aggregate campaign "${campaign.name}":`, err);
      }
    }
  } catch (err) {
    console.error("[sporta-scheduler] Cycle error:", err);
  }
}

function scheduleNextCycle(): void {
  if (schedulerHandle) clearTimeout(schedulerHandle);
  // Wake up every 15 minutes to check which campaigns are due
  schedulerHandle = setTimeout(async () => {
    if (running) {
      await runSchedulerCycle();
      scheduleNextCycle();
    }
  }, 15 * 60_000);
}

export function startSportaScheduler(): void {
  if (running) return;
  running = true;
  // Run an initial cycle shortly after startup (60 s delay to let DB connect)
  setTimeout(() => {
    if (running) {
      runSchedulerCycle().catch((err) =>
        console.error("[sporta-scheduler] Initial cycle error:", err),
      );
    }
  }, 60_000);
  scheduleNextCycle();
  console.log("[sporta-scheduler] Started — will auto-aggregate active SPORTA campaigns");
}

export function stopSportaScheduler(): void {
  running = false;
  if (schedulerHandle) {
    clearTimeout(schedulerHandle);
    schedulerHandle = null;
  }
  console.log("[sporta-scheduler] Stopped");
}
