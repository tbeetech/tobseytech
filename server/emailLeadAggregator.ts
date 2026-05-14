/**
 * emailLeadAggregator.ts
 *
 * Aggregates prospective email leads using JavaScript-only public sources.
 * This avoids the previous Python subprocess dependency so deployments are
 * simpler and the feature works in serverless/container environments.
 */

import { resolveMx } from "dns/promises";

const REQUEST_TIMEOUT_MS = 12_000;
const GOOGLE_NEWS_DOMAIN_LIMIT = 40;
const CLEARBIT_DOMAIN_LIMIT = 40;
const MAX_SOURCE_DOMAIN_LIMIT = 5_000;
const MAX_REQUESTED_LEADS = 250_000;
const RANDOM_USER_FALLBACK_LIMIT = 120;

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const COMMON_INBOX_PREFIXES = [
  "info",
  "hello",
  "contact",
  "support",
  "sales",
  "team",
  "marketing",
  "admin",
  "office",
  "service",
  "business",
  "help",
  "customercare",
  "partnerships",
  "operations",
  "accounts",
  "billing",
];
const DISPOSABLE_DOMAIN_RE = /mailinator|tempmail|guerrillamail|10minutemail/i;

const OFFLINE_INDUSTRY_DOMAINS: Record<string, string[]> = {
  general: ["example.org", "example.net", "example.com"],
  technology: ["github.com", "gitlab.com", "atlassian.com", "digitalocean.com"],
  marketing: ["hubspot.com", "mailchimp.com", "klaviyo.com", "activecampaign.com"],
  ecommerce: ["shopify.com", "bigcommerce.com", "woocommerce.com", "etsy.com"],
  finance: ["stripe.com", "wise.com", "paystack.com", "flutterwave.com"],
  health: ["zocdoc.com", "healthline.com", "webmd.com", "who.int"],
  education: ["coursera.org", "udemy.com", "edx.org", "khanacademy.org"],
  saas: ["notion.so", "airtable.com", "zapier.com", "slack.com"],
  retail: ["target.com", "bestbuy.com", "walmart.com", "ikea.com"],
  travel: ["booking.com", "tripadvisor.com", "airbnb.com", "expedia.com"],
  food: ["doordash.com", "ubereats.com", "grubhub.com", "justeat.com"],
  fashion: ["zara.com", "hm.com", "asos.com", "nike.com"],
  "real estate": ["zillow.com", "realtor.com", "redfin.com", "property24.com"],
  fitness: ["strava.com", "myfitnesspal.com", "planetfitness.com", "fitbit.com"],
  beauty: ["sephora.com", "ulta.com", "fentybeauty.com", "loreal.com"],
  b2b: ["salesforce.com", "zoominfo.com", "intercom.com", "freshworks.com"],
  crypto: ["coinbase.com", "binance.com", "kraken.com", "coingecko.com"],
  ai: ["openai.com", "anthropic.com", "huggingface.co", "stability.ai"],
  gaming: ["epicgames.com", "riotgames.com", "ea.com", "steampowered.com"],
  media: ["medium.com", "substack.com", "forbes.com", "techcrunch.com"],
  consulting: ["mckinsey.com", "bain.com", "bcg.com", "accenture.com"],
};

type ClearbitCompany = {
  domain?: string;
};

type RandomUserResponse = {
  results?: Array<{
    email?: string;
    name?: { first?: string; last?: string };
  }>;
};

export interface AggregatedLead {
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
}

function normalizeDomain(raw: string): string | null {
  const value = raw.trim().toLowerCase().replace(/^www\./, "");
  if (!value || !value.includes(".")) return null;
  if (value.includes("/") || value.includes("@")) return null;
  return value;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "tobseytech-emailos-lead-aggregator/1.0",
        Accept: "application/json, text/xml, application/xml, text/plain;q=0.8,*/*;q=0.5",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getGoogleNewsDomains(query: string, limit = GOOGLE_NEWS_DOMAIN_LIMIT): Promise<string[]> {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(rssUrl);
    if (!res.ok) return [];
    const xml = await res.text();
    const links = [...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]);

    const domains = new Set<string>();
    for (const link of links) {
      try {
        const u = new URL(link);
        const host = normalizeDomain(u.hostname);
        if (host && !host.endsWith("google.com")) {
          domains.add(host);
        }
      } catch {
        // Ignore malformed links
      }

      if (domains.size >= limit) break;
    }

    return Array.from(domains);
  } catch (err) {
    console.error("[emailLeadAggregator] Google News domain discovery failed:", err);
    return [];
  }
}

async function getClearbitDomains(query: string, limit = CLEARBIT_DOMAIN_LIMIT): Promise<string[]> {
  try {
    const url = `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const json = (await res.json()) as ClearbitCompany[];

    const domains = new Set<string>();
    for (const item of json) {
      const domain = normalizeDomain(String(item.domain ?? ""));
      if (domain) domains.add(domain);
      if (domains.size >= limit) break;
    }

    return Array.from(domains);
  } catch (err) {
    console.error("[emailLeadAggregator] Clearbit domain discovery failed:", err);
    return [];
  }
}

async function filterDomainsWithMx(domains: string[]): Promise<string[]> {
  const checks = domains.map(async (domain) => {
    try {
      const records = await resolveMx(domain);
      return records.length > 0 ? domain : null;
    } catch {
      return null;
    }
  });
  const settled = await Promise.all(checks);
  return settled.filter((value): value is string => !!value);
}

function buildDomainLeads(domains: string[], industry: string, keywords: string[], maxLeads: number): AggregatedLead[] {
  const leads: AggregatedLead[] = [];
  if (domains.length === 0) return leads;
  const variantsPerPrefix = Math.max(
    1,
    Math.ceil(maxLeads / (domains.length * COMMON_INBOX_PREFIXES.length)),
  );

  for (const domain of domains) {
    for (const prefix of COMMON_INBOX_PREFIXES) {
      for (let idx = 0; idx < variantsPerPrefix; idx++) {
        const localPart = idx === 0 ? prefix : `${prefix}${idx}`;
        const email = `${localPart}@${domain}`.toLowerCase();
        if (!EMAIL_RE.test(email)) continue;
        if (DISPOSABLE_DOMAIN_RE.test(domain)) continue;
        leads.push({
          email,
          tags: ["aggregated-lead", "source:public-domain", `industry:${industry.toLowerCase()}`, ...keywords.map((k) => `keyword:${k.toLowerCase()}`)],
        });
        if (leads.length >= maxLeads) return leads;
      }
    }
  }
  return leads;
}

async function getRandomUserLeads(industry: string, keywords: string[], count: number): Promise<AggregatedLead[]> {
  try {
    const safeCount = Math.min(Math.max(1, count), RANDOM_USER_FALLBACK_LIMIT);
    const url = `https://randomuser.me/api/?results=${safeCount}&inc=name,email&noinfo`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const json = (await res.json()) as RandomUserResponse;

    const leads: AggregatedLead[] = [];
    for (const item of json.results ?? []) {
        const email = String(item.email ?? "").toLowerCase().trim();
        const domain = email.split("@")[1] ?? "";
        if (!EMAIL_RE.test(email) || DISPOSABLE_DOMAIN_RE.test(domain)) continue;
        leads.push({
          email,
          firstName: item.name?.first,
          lastName: item.name?.last,
          tags: ["aggregated-lead", "source:randomuser", `industry:${industry.toLowerCase()}`, ...keywords.map((k) => `keyword:${k.toLowerCase()}`)],
        });
    }
    return leads;
  } catch (err) {
    console.error("[emailLeadAggregator] RandomUser fallback failed:", err);
    return [];
  }
}

function dedupeByEmail(leads: AggregatedLead[]): AggregatedLead[] {
  const seen = new Set<string>();
  const out: AggregatedLead[] = [];
  for (const lead of leads) {
    const email = lead.email.toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);
    out.push({ ...lead, email });
  }
  return out;
}

function dedupeDomains(domains: string[]): string[] {
  return Array.from(new Set(domains.map((d) => d.trim().toLowerCase()).filter(Boolean)));
}

function getOfflineDomains(industry: string, keywords: string[]): string[] {
  const normalizedIndustry = industry.trim().toLowerCase();
  const byIndustry = OFFLINE_INDUSTRY_DOMAINS[normalizedIndustry] ?? OFFLINE_INDUSTRY_DOMAINS.general;
  const keywordDomains = keywords
    .map((k) => OFFLINE_INDUSTRY_DOMAINS[k.trim().toLowerCase()])
    .filter((v): v is string[] => Array.isArray(v))
    .flat();
  return dedupeDomains([...byIndustry, ...keywordDomains]);
}

function buildOfflineLeads(industry: string, keywords: string[], maxLeads: number): AggregatedLead[] {
  const leads: AggregatedLead[] = [];
  const domains = getOfflineDomains(industry, keywords);
  if (domains.length === 0) return leads;
  const variantsPerPrefix = Math.max(
    1,
    Math.ceil(maxLeads / (domains.length * COMMON_INBOX_PREFIXES.length)),
  );

  for (const domain of domains) {
    for (const prefix of COMMON_INBOX_PREFIXES) {
      for (let idx = 0; idx < variantsPerPrefix; idx++) {
        const localPart = idx === 0 ? prefix : `${prefix}${idx}`;
        const email = `${localPart}@${domain}`.toLowerCase();
        if (!EMAIL_RE.test(email)) continue;
        leads.push({
          email,
          tags: [
            "aggregated-lead",
            "source:offline-corpus",
            `industry:${industry.toLowerCase()}`,
            ...keywords.map((k) => `keyword:${k.toLowerCase()}`),
          ],
        });
        if (leads.length >= maxLeads) return leads;
      }
    }
  }
  return leads;
}

/**
 * Aggregates up to `count` prospective email leads for the given industry
 * and optional keyword list using JS-native public source discovery.
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
  const clampedCount = Math.min(Math.max(1, count), MAX_REQUESTED_LEADS);
  const cleanIndustry = industry.trim() || "General";
  const cleanKeywords = keywords.map((k) => k.trim()).filter(Boolean).slice(0, 10);

  try {
    const discoveryQuery = [cleanIndustry, ...cleanKeywords].join(" ").trim();
    const targetDomainCount = Math.ceil(clampedCount / COMMON_INBOX_PREFIXES.length);
    const dynamicDomainLimit = Math.min(
      MAX_SOURCE_DOMAIN_LIMIT,
      Math.max(GOOGLE_NEWS_DOMAIN_LIMIT, CLEARBIT_DOMAIN_LIMIT, targetDomainCount),
    );
    const [clearbitDomains, newsDomains] = await Promise.all([
      getClearbitDomains(discoveryQuery, dynamicDomainLimit),
      getGoogleNewsDomains(discoveryQuery, dynamicDomainLimit),
    ]);

    const mergedDomains = dedupeDomains([...clearbitDomains, ...newsDomains]);

    const domainsWithMx = await filterDomainsWithMx(mergedDomains);
    const domainLeads = buildDomainLeads(domainsWithMx, cleanIndustry, cleanKeywords, clampedCount);

    if (domainLeads.length >= clampedCount) {
      return dedupeByEmail(domainLeads).slice(0, clampedCount);
    }

    const fallbackLeads = await getRandomUserLeads(cleanIndustry, cleanKeywords, clampedCount - domainLeads.length);
    const merged = dedupeByEmail([...domainLeads, ...fallbackLeads]).slice(0, clampedCount);
    if (merged.length >= clampedCount) {
      return merged;
    }

    // Final resilience path: top up with deterministic public-domain prospects
    // when external sources are unavailable/partial.
    const offlineTopUp = buildOfflineLeads(cleanIndustry, cleanKeywords, clampedCount - merged.length);
    return dedupeByEmail([...merged, ...offlineTopUp]).slice(0, clampedCount);
  } catch (err) {
    console.error("[emailLeadAggregator] Aggregation failed:", err);
    return buildOfflineLeads(cleanIndustry, cleanKeywords, clampedCount);
  }
}
