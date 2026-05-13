#!/usr/bin/env python3
"""
emailScraper.py — Pure Python email scraper for EmailOS lead aggregation.

Strategy:
  1. Discover real business domains via Google News RSS for the requested
     industry / keywords.  (No API key required — plain RSS feed.)
  2. For each discovered domain try to fetch common contact/about pages
     and extract real email addresses using regex.
  3. Fall back to generic business-email prefixes (info@, hello@, …) for
     domains where no explicit addresses are found.
  4. Deduplicate, validate, and return JSON to stdout.

Dependencies (standard + open-source):
  - requests      — HTTP fetching
  - beautifulsoup4— HTML parsing
  - re            — regex email extraction
  - urllib        — URL normalisation
  - concurrent.futures — parallel page fetching
  - xml.etree     — RSS/XML parsing

Usage (called by emailLeadAggregator.ts via child_process):
  python3 emailScraper.py
  # reads {"industry":"...","keywords":[...],"count":50} from stdin
  # writes JSON array of leads to stdout
"""

import sys
import json
import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FuturesTimeout
from xml.etree import ElementTree

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

EMAIL_RE = re.compile(
    r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
    re.IGNORECASE,
)

# Domains that should never appear in results
BLOCKED_EMAIL_DOMAINS: set[str] = {
    'example.com', 'example.org', 'example.net',
    'test.com', 'testing.com', 'domain.com',
    'yourdomain.com', 'yourcompany.com', 'company.com',
    'placeholder.com', 'sample.com', 'lorem.com',
    'email.com', 'mail.com', 'mailbox.com',
    'sentry.io', 'wixpress.com', 'wordpress.com',
    'google.com', 'bing.com', 'yahoo.com',
    'facebook.com', 'twitter.com', 'x.com',
    'linkedin.com', 'instagram.com', 'tiktok.com',
    'reddit.com', 'wikipedia.org', 'github.com',
    'stackoverflow.com', 'amazon.com', 'ebay.com',
    'apple.com', 'microsoft.com',
}

# Fragments that identify crawl-noise / bot-trap hostnames
BLOCKED_HOST_FRAGMENTS: list[str] = [
    'google', 'bing', 'yahoo', 'facebook', 'twitter',
    'linkedin', 'instagram', 'tiktok', 'reddit', 'wikipedia',
    'amazon', 'ebay', 'apple', 'microsoft',
]

# Local parts that are not real inboxes
BLOCKED_LOCAL_PARTS: set[str] = {
    'noreply', 'no-reply', 'donotreply', 'do-not-reply',
    'bounce', 'mailer-daemon', 'postmaster', 'abuse',
    'spam', 'webmaster', 'root', 'admin',
}

# Paths to probe for contact emails on a domain
CONTACT_PATHS: list[str] = [
    '/contact',
    '/contact-us',
    '/about',
    '/about-us',
    '/team',
    '/get-in-touch',
    '/reach-us',
]

# Generic prefixes used when no explicit address is found on a domain
BIZ_PREFIXES: list[str] = [
    'hello', 'info', 'contact',
    'marketing', 'sales', 'team', 'support',
]

INDUSTRY_SEARCH_TERMS: dict[str, str] = {
    'Technology':    'tech startup company',
    'Marketing':     'digital marketing agency',
    'Ecommerce':     'ecommerce online store',
    'Finance':       'fintech financial services',
    'Health':        'health wellness brand',
    'Education':     'edtech learning platform',
    'SaaS':          'SaaS software company',
    'Retail':        'retail brand',
    'Travel':        'travel tourism company',
    'Food':          'food beverage brand',
    'Fashion':       'fashion clothing brand',
    'Real Estate':   'real estate company',
    'Fitness':       'fitness gym wellness',
    'Beauty':        'beauty skincare brand',
    'B2B':           'B2B services',
    'Crypto':        'crypto blockchain startup',
    'AI':            'artificial intelligence company',
    'Gaming':        'gaming company studio',
    'Media':         'media publisher',
    'Consulting':    'consulting firm',
    'General':       'business company brand',
}

REQUEST_TIMEOUT = 8          # seconds per HTTP request
MAX_DOMAINS_TO_SCRAPE = 25   # cap the number of domains we actively crawl
MAX_BODY_BYTES = 60_000      # bytes of response body to parse
PARALLEL_WORKERS = 6

SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': (
        'Mozilla/5.0 (compatible; TobseyTechEmailOS/1.0; '
        '+https://tobseytech.biz)'
    ),
    'Accept': 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
})

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _google_news_feed_url(query: str) -> str:
    q = urllib.parse.quote(query)
    return (
        f'https://news.google.com/rss/search?q={q}'
        '&hl=en-US&gl=US&ceid=US:en'
    )


def _extract_domain(url: str) -> str | None:
    """Return clean hostname or None if it should be excluded."""
    try:
        parsed = urllib.parse.urlparse(url)
        host: str = parsed.hostname or ''
        if host.startswith('www.'):
            host = host[4:]
        host = host.lower()
        if not host:
            return None
        if any(frag in host for frag in BLOCKED_HOST_FRAGMENTS):
            return None
        if not re.match(r'^[a-z0-9.\-]+\.[a-z]{2,}$', host):
            return None
        return host
    except Exception:
        return None


def _is_valid_email(email: str) -> bool:
    """Basic sanity checks beyond the regex."""
    parts = email.split('@', 1)
    if len(parts) != 2:
        return False
    local, domain = parts[0].lower(), parts[1].lower()
    if domain in BLOCKED_EMAIL_DOMAINS:
        return False
    if local in BLOCKED_LOCAL_PARTS:
        return False
    if len(local) < 2 or len(local) > 64:
        return False
    # Skip anything that looks like a filename/asset path
    if any(domain.endswith(ext) for ext in ('.png', '.jpg', '.gif', '.css', '.js')):
        return False
    return True


def _extract_name_near(text: str, email: str) -> tuple[str | None, str | None]:
    """Try to find a FirstName LastName pair in the 300 chars around an email."""
    idx = text.find(email)
    if idx < 0:
        return None, None
    snippet = text[max(0, idx - 200): idx + 200]
    m = re.search(r'\b([A-Z][a-z]{2,20})\s+([A-Z][a-z]{2,20})\b', snippet)
    if m:
        return m.group(1), m.group(2)
    return None, None


# ---------------------------------------------------------------------------
# Step 1 — Domain discovery via Google News RSS
# ---------------------------------------------------------------------------

def fetch_google_news_domains(query: str) -> list[str]:
    """Parse Google News RSS and extract unique business domains."""
    url = _google_news_feed_url(query)
    try:
        resp = SESSION.get(url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        root = ElementTree.fromstring(resp.content)
        domains: dict[str, None] = {}   # ordered set
        for item in root.findall('.//item'):
            link_el = item.find('link')
            link_text = (link_el.text or '').strip() if link_el is not None else ''
            if not link_text:
                # Google News encodes links differently — try <guid>
                guid_el = item.find('guid')
                link_text = (guid_el.text or '').strip() if guid_el is not None else ''
            d = _extract_domain(link_text)
            if d and d not in domains:
                domains[d] = None
        return list(domains.keys())
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Step 2 — Scrape individual domain pages for real email addresses
# ---------------------------------------------------------------------------

def scrape_page_for_emails(url: str) -> list[dict]:
    """Fetch one URL and return a list of {email, firstName, lastName} dicts."""
    leads: list[dict] = []
    try:
        resp = SESSION.get(
            url,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=True,
        )
        if not resp.ok:
            return []
        ct = resp.headers.get('Content-Type', '')
        if 'html' not in ct and 'text' not in ct:
            return []

        raw = resp.content[:MAX_BODY_BYTES].decode('utf-8', errors='ignore')

        # Use BeautifulSoup to extract visible text + mailto hrefs
        soup = BeautifulSoup(raw, 'html.parser')

        collected: set[str] = set()

        # 1. Grab all mailto: links — most reliable source
        for tag in soup.find_all('a', href=True):
            href: str = tag['href']
            if href.lower().startswith('mailto:'):
                addr = href[7:].split('?')[0].strip().lower()
                if addr and _is_valid_email(addr):
                    collected.add(addr)

        # 2. Scan visible text for email patterns
        text = soup.get_text(separator=' ')
        for m in EMAIL_RE.finditer(text):
            addr = m.group(0).lower()
            if _is_valid_email(addr):
                collected.add(addr)

        # Build lead objects
        for email in collected:
            first, last = _extract_name_near(text, email)
            leads.append({
                'email': email,
                'firstName': first,
                'lastName': last,
            })
    except Exception:
        pass
    return leads


def scrape_domain(domain: str) -> list[dict]:
    """Try contact/about pages on a domain; return leads whose email is
    on that domain (or a sub-domain) only."""
    seen: set[str] = set()
    results: list[dict] = []

    for path in CONTACT_PATHS:
        url = f'https://{domain}{path}'
        for lead in scrape_page_for_emails(url):
            email = lead['email']
            email_domain = email.split('@', 1)[1]
            if email_domain == domain or email_domain.endswith(f'.{domain}'):
                if email not in seen:
                    seen.add(email)
                    results.append(lead)
        if results:
            break  # stop probing more paths once we have emails

    return results


# ---------------------------------------------------------------------------
# Main aggregation
# ---------------------------------------------------------------------------

def aggregate_leads(industry: str, keywords: list[str], count: int) -> list[dict]:
    count = max(1, min(count, 500))

    search_term = (
        ' '.join(keywords)
        if keywords
        else INDUSTRY_SEARCH_TERMS.get(industry, industry)
    )
    base_tags = ['aggregated-lead', industry.lower().replace(' ', '-')]

    # ── Step 1: Domain discovery ──────────────────────────────────────────────
    domains = fetch_google_news_domains(search_term)
    if not domains:
        domains = fetch_google_news_domains(
            f'{industry} company business'
        )

    if not domains:
        return []

    # ── Step 2: Parallel email scraping ───────────────────────────────────────
    leads: list[dict] = []
    seen_emails: set[str] = set()
    to_scrape = domains[:MAX_DOMAINS_TO_SCRAPE]

    try:
        with ThreadPoolExecutor(max_workers=PARALLEL_WORKERS) as executor:
            futures = {
                executor.submit(scrape_domain, d): d
                for d in to_scrape
            }
            for future in as_completed(futures, timeout=45):
                if len(leads) >= count:
                    break
                try:
                    domain_leads = future.result()
                except Exception:
                    domain_leads = []

                for lead in domain_leads:
                    if len(leads) >= count:
                        break
                    email = lead['email']
                    if email not in seen_emails:
                        seen_emails.add(email)
                        leads.append({
                            'email': email,
                            'firstName': lead.get('firstName'),
                            'lastName': lead.get('lastName'),
                            'tags': list(base_tags),
                        })
    except FuturesTimeout:
        pass  # use whatever we gathered so far

    # ── Step 3: Prefix fill-up for remaining quota ────────────────────────────
    for domain in domains:
        for prefix in BIZ_PREFIXES:
            if len(leads) >= count:
                break
            email = f'{prefix}@{domain}'
            if email not in seen_emails and _is_valid_email(email):
                seen_emails.add(email)
                leads.append({
                    'email': email,
                    'firstName': None,
                    'lastName': None,
                    'tags': list(base_tags) + ['business-contact'],
                })
        if len(leads) >= count:
            break

    return leads[:count]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
        industry: str = str(payload.get('industry', 'General'))
        keywords: list[str] = [str(k) for k in payload.get('keywords', [])]
        count: int = int(payload.get('count', 50))
        result = aggregate_leads(industry, keywords, count)
        sys.stdout.write(json.dumps(result))
        sys.stdout.flush()
    except Exception as exc:
        sys.stderr.write(json.dumps({'error': str(exc)}) + '\n')
        sys.exit(1)
