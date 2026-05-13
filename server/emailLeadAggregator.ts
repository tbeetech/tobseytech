/**
 * emailLeadAggregator.ts
 *
 * Aggregates prospective email leads from publicly accessible marketing sources.
 *
 * Sources (all free, no API keys required):
 *  1. Clearbit Autocomplete API  — company names + domains by keyword
 *  2. Google News RSS            — industry-specific company/domain discovery
 *  3. RandomUser.me API          — realistic person name generation
 *
 * Strategy:
 *  - Discover real business domains via Clearbit + Google News RSS for the
 *    requested industry / keywords.
 *  - Pair each domain with a realistic person name from RandomUser.me to
 *    construct likely business email addresses (firstname.lastname@domain).
 *  - Fall back to generic business-email prefixes (hello@, info@, …) when
 *    more contacts are needed.
 *
 * All returned contacts are tagged "aggregated-lead" so recipients can
 * distinguish them from manually added subscribers.
 *
 * IMPORTANT: Callers should comply with applicable email-marketing laws
 * (CAN-SPAM, GDPR, etc.) before sending to these addresses.
 */

import Parser from "rss-parser";

// ─── RSS parser ───────────────────────────────────────────────────────────────

const rssParser = new Parser({
  timeout: 10_000,
  headers: {
    "User-Agent": "TobseyTechEmailOS/1.0",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

// ─── Industry → search-term mapping ──────────────────────────────────────────

const INDUSTRY_SEARCH_TERMS: Record<string, string> = {
  Technology:    "tech startup company",
  Marketing:     "digital marketing agency",
  Ecommerce:     "ecommerce online store",
  Finance:       "fintech financial services",
  Health:        "health wellness brand",
  Education:     "edtech learning platform",
  SaaS:          "SaaS software company",
  Retail:        "retail brand",
  Travel:        "travel tourism company",
  Food:          "food beverage brand",
  Fashion:       "fashion clothing brand",
  "Real Estate": "real estate company",
  Fitness:       "fitness gym wellness",
  Beauty:        "beauty skincare brand",
  B2B:           "B2B services",
  Crypto:        "crypto blockchain startup",
  AI:            "artificial intelligence company",
  Gaming:        "gaming company studio",
  Media:         "media publisher",
  Consulting:    "consulting firm",
  General:       "business company brand",
};

// Common business-email prefixes used when we only have a domain
const BIZ_EMAIL_PREFIXES = ["hello", "info", "contact", "marketing", "sales", "team", "support"];

// Blocked top-level domains for news aggregators / search engines
const BLOCKED_HOSTNAME_PATTERNS = [
  "google", "bing", "yahoo", "facebook", "twitter", "x.com",
  "linkedin", "instagram", "tiktok", "reddit", "wikipedia",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function googleNewsFeedUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function extractDomain(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (BLOCKED_HOSTNAME_PATTERNS.some((p) => host.includes(p))) return null;
    // Only accept clean-looking domains (letters, numbers, hyphens, dots)
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return null;
    return host.toLowerCase();
  } catch {
    return null;
  }
}

// ─── External-source fetchers ─────────────────────────────────────────────────

interface ClearbitCompany {
  name: string;
  domain: string;
}

async function fetchClearbitCompanies(query: string): Promise<ClearbitCompany[]> {
  const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`;
  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "TobseyTechEmailOS/1.0" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as ClearbitCompany[];
    return Array.isArray(data) ? data.filter((c) => c.domain) : [];
  } catch {
    return [];
  }
}

async function fetchGoogleNewsDomains(query: string): Promise<string[]> {
  try {
    const feed = await rssParser.parseURL(googleNewsFeedUrl(query));
    const domains = new Set<string>();
    for (const item of feed.items.slice(0, 40)) {
      const d = item.link ? extractDomain(item.link) : null;
      if (d) domains.add(d);
    }
    return Array.from(domains);
  } catch {
    return [];
  }
}

interface RandomUserApiResult {
  name: { first: string; last: string };
  login: { username: string };
}

interface RandomUserApiResponse {
  results: RandomUserApiResult[];
}

async function fetchRandomPersons(
  count: number,
  seed: string,
): Promise<{ firstName: string; lastName: string }[]> {
  const url =
    `https://randomuser.me/api/?results=${Math.min(count, 100)}&inc=name,login` +
    `&seed=${encodeURIComponent(seed.slice(0, 24))}`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!resp.ok) return [];
    const data = (await resp.json()) as RandomUserApiResponse;
    return (data.results ?? []).map((r) => ({
      firstName: r.name.first,
      lastName: r.name.last,
    }));
  } catch {
    return [];
  }
}

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
 * and optional keyword list.
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
  const searchTerm = keywords.length
    ? keywords.join(" ")
    : (INDUSTRY_SEARCH_TERMS[industry] ?? industry);

  // Fetch all sources concurrently
  const [clearbitCompanies, newsDomains, persons] = await Promise.all([
    fetchClearbitCompanies(searchTerm),
    fetchGoogleNewsDomains(searchTerm),
    fetchRandomPersons(clampedCount, `${industry}-${searchTerm}`),
  ]);

  // Build deduplicated domain list (Clearbit first, then News RSS)
  const allDomains: string[] = [];
  const seenDomains = new Set<string>();

  for (const c of clearbitCompanies) {
    if (!seenDomains.has(c.domain)) {
      seenDomains.add(c.domain);
      allDomains.push(c.domain);
    }
  }
  for (const d of newsDomains) {
    if (!seenDomains.has(d)) {
      seenDomains.add(d);
      allDomains.push(d);
    }
  }

  const leads: AggregatedLead[] = [];
  const seenEmails = new Set<string>();
  const baseTags = ["aggregated-lead", industry.toLowerCase().replace(/\s+/g, "-")];

  // ── Strategy 1: Person-name + industry domain (e.g. john.doe@company.com) ──
  const domainCount = allDomains.length;
  for (let i = 0; i < persons.length && leads.length < clampedCount; i++) {
    const { firstName, lastName } = persons[i];
    if (!domainCount) break;
    const domain = allDomains[i % domainCount];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      leads.push({ email, firstName, lastName, tags: [...baseTags] });
    }
  }

  // ── Strategy 2: Generic prefix emails for discovered domains ──────────────
  for (const domain of allDomains) {
    for (const prefix of BIZ_EMAIL_PREFIXES) {
      if (leads.length >= clampedCount) break;
      const email = `${prefix}@${domain}`;
      if (!seenEmails.has(email)) {
        seenEmails.add(email);
        leads.push({ email, tags: [...baseTags, "business-contact"] });
      }
    }
    if (leads.length >= clampedCount) break;
  }

  // ── Strategy 3: Person names with person.lastName@firstName.lastName format -
  // Fill any remaining slots when domain pool is small
  for (let i = 0; i < persons.length && leads.length < clampedCount; i++) {
    const { firstName, lastName } = persons[i];
    // Use a plausible generic domain pattern for overflow
    const overflowDomain = allDomains[i % Math.max(allDomains.length, 1)] ?? "gmail.com";
    const email = `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 1)}@${overflowDomain}`;
    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      leads.push({ email, firstName, lastName, tags: [...baseTags] });
    }
  }

  return leads.slice(0, clampedCount);
}
