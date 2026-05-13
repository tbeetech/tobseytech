#!/usr/bin/env python3
"""
emailScraper.py — Pure Python email scraper for EmailOS lead aggregation.

Strategy:
  1. Discover real business domains via Bing News RSS.  Each Bing RSS item
     embeds the actual article URL in a `url=` query-string parameter; we
     extract that URL, fetch the article, and harvest external company links
     from the article body.  This sidesteps the Google News RSS problem where
     all links resolve to news.google.com (a blocked domain).
  2. For each discovered domain try to fetch common contact/about pages
     and extract real email addresses using regex + mailto: parsing.
  3. Fall back to generic business-email prefixes (info@, hello@, …) for
     domains where no explicit addresses are found.
  4. Deduplicate, validate, and return JSON to stdout.

Dependencies (stdlib only — no third-party packages required):
  - requests      — HTTP fetching
  - re            — regex email extraction
  - urllib        — URL normalisation
  - html.parser   — stdlib HTML parsing (replaces beautifulsoup4)
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
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as ConcurrentFuturesTimeout
from xml.etree import ElementTree
from html.parser import HTMLParser

import requests

# ---------------------------------------------------------------------------
# Stdlib HTML parser utilities (replaces beautifulsoup4)
# ---------------------------------------------------------------------------

class _LinkAndTextParser(HTMLParser):
    """Minimal HTMLParser that collects href attributes and visible text.

    Skips <script> and <style> tag content so that JS/CSS strings do not
    pollute the visible-text buffer used for email/name extraction.
    """

    def __init__(self) -> None:
        super().__init__()
        self.hrefs: list[str] = []
        self._text_parts: list[str] = []
        self._skip_depth: int = 0   # depth inside script/style blocks

    # --- tag handlers -------------------------------------------------------

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag_lower = tag.lower()
        if tag_lower in ('script', 'style'):
            self._skip_depth += 1
            return
        attr_dict = {k.lower(): (v or '') for k, v in attrs}
        href = attr_dict.get('href', '')
        if href:
            self.hrefs.append(href)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() in ('script', 'style') and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._skip_depth == 0:
            self._text_parts.append(data)

    # --- convenience --------------------------------------------------------

    @property
    def text(self) -> str:
        return ' '.join(self._text_parts)


def _parse_html(raw: str) -> _LinkAndTextParser:
    """Parse raw HTML bytes/string and return a populated _LinkAndTextParser."""
    parser = _LinkAndTextParser()
    try:
        parser.feed(raw)
    except Exception:
        pass
    return parser


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

# News/media sites — we USE their articles for link-discovery but never treat
# them as lead-generation targets (their contact emails are editorial, not B2B).
NEWS_SITE_FRAGMENTS: list[str] = [
    'techcrunch', 'siliconangle', 'bizjournals', 'reuters', 'bloomberg',
    'wsj', 'cnbc', 'cnn', 'bbc', 'theverge', 'wired', 'forbes', 'fortune',
    'mashable', 'engadget', 'gizmodo', 'venturebeat', 'businesswire',
    'prnewswire', 'globenewswire', 'apnews', 'theregister', 'zdnet',
    'infoworld', 'pcmag', 'cnet', 'arstechnica', 'thenextweb',
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
MAX_SCRAPE_TIMEOUT = 45      # seconds to wait for all parallel scraping futures
MAX_DOMAINS_TO_SCRAPE = 25   # cap the number of domains we actively crawl
MAX_BODY_BYTES = 60_000      # bytes of response body to parse
PARALLEL_WORKERS = 6
MAX_ARTICLES_TO_PARSE = 6    # max news articles to fetch for link extraction

# Email local-part length bounds (RFC 5321 §4.5.3)
MIN_LOCAL_LENGTH = 2
MAX_LOCAL_LENGTH = 64

# File-like suffixes that must not appear in email domains (e.g. accidentally
# matched image or asset URLs parsed from raw HTML)
ASSET_EXTENSIONS: list[str] = ['.png', '.jpg', '.gif', '.css', '.js']

# Characters of surrounding text to search for a name hint near each email
NAME_CONTEXT_CHARS = 200

SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/120.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-US,en;q=0.9',
})

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _extract_domain(url: str, allow_news: bool = False) -> str | None:
    """Return clean hostname or None if it should be excluded.

    When allow_news=True, news/media sites are not filtered out (we still
    need to visit them to harvest company links from their articles).
    """
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
        if not allow_news and any(frag in host for frag in NEWS_SITE_FRAGMENTS):
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
    if len(local) < MIN_LOCAL_LENGTH or len(local) > MAX_LOCAL_LENGTH:
        return False
    # Skip anything that looks like a filename/asset path
    if any(domain.endswith(ext) for ext in ASSET_EXTENSIONS):
        return False
    return True


def _extract_name_near(text: str, email: str) -> tuple[str | None, str | None]:
    """Try to find a FirstName LastName pair within NAME_CONTEXT_CHARS of an email."""
    idx = text.find(email)
    if idx < 0:
        return None, None
    snippet = text[max(0, idx - NAME_CONTEXT_CHARS): idx + NAME_CONTEXT_CHARS]
    m = re.search(r'\b([A-Z][a-z]{2,20})\s+([A-Z][a-z]{2,20})\b', snippet)
    if m:
        return m.group(1), m.group(2)
    return None, None


# ---------------------------------------------------------------------------
# Step 1 — Domain discovery via Bing News RSS + article link harvesting
# ---------------------------------------------------------------------------

def _bing_news_feed_url(query: str) -> str:
    return f'https://www.bing.com/news/search?q={urllib.parse.quote(query)}&format=rss'


def _parse_bing_rss_article_urls(query: str) -> list[str]:
    """
    Fetch Bing News RSS for the given query and return the actual article URLs.

    Bing News RSS embeds the real destination inside a redirect URL of the form:
      http://www.bing.com/news/apiclick.aspx?...&url=<encoded_url>&...
    We decode that `url=` parameter to get the genuine article URL.
    """
    rss_url = _bing_news_feed_url(query)
    try:
        resp = SESSION.get(rss_url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        root = ElementTree.fromstring(resp.content)
        article_urls: list[str] = []
        seen: set[str] = set()
        for item in root.findall('.//item'):
            link_el = item.find('link')
            raw_link = (link_el.text or '').strip() if link_el is not None else ''
            if not raw_link:
                continue
            # Extract the actual URL from the Bing redirect
            parsed = urllib.parse.urlparse(raw_link)
            qs = urllib.parse.parse_qs(parsed.query)
            actual = qs.get('url', [''])[0] or raw_link
            if actual and actual not in seen:
                seen.add(actual)
                article_urls.append(actual)
        return article_urls
    except Exception:
        return []


def _extract_company_domains_from_article(article_url: str) -> list[str]:
    """
    Fetch a news article and return the external company domains linked from it.
    We skip the article's own domain and any news/blocked sites.
    """
    article_host = _extract_domain(article_url, allow_news=True) or ''
    try:
        resp = SESSION.get(article_url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        if not resp.ok:
            return []
        ct = resp.headers.get('Content-Type', '')
        if 'html' not in ct and 'text' not in ct:
            return []
        raw_html = resp.content[:MAX_BODY_BYTES].decode('utf-8', errors='ignore')
        parsed = _parse_html(raw_html)
        domains: dict[str, None] = {}
        for href in parsed.hrefs:
            if not href.startswith('http'):
                continue
            d = _extract_domain(href)   # news sites filtered out here
            if d and d != article_host and d not in domains:
                domains[d] = None
        return list(domains.keys())
    except Exception:
        return []


def fetch_business_domains(query: str, fallback_query: str) -> list[str]:
    """
    Discover real business domains by:
      1. Fetching Bing News RSS article URLs for `query`
      2. Visiting each article and harvesting external company links
      3. Falling back to `fallback_query` if we found nothing
    Returns a deduplicated, ordered list of business domain strings.
    """
    def _run(q: str) -> list[str]:
        article_urls = _parse_bing_rss_article_urls(q)
        domains: dict[str, None] = {}
        for art_url in article_urls[:MAX_ARTICLES_TO_PARSE]:
            for d in _extract_company_domains_from_article(art_url):
                if d not in domains:
                    domains[d] = None
        return list(domains.keys())

    domains = _run(query)
    if not domains:
        domains = _run(fallback_query)
    return domains


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

        # Use stdlib html.parser to extract visible text + mailto hrefs
        parsed = _parse_html(raw)
        text = parsed.text

        collected: set[str] = set()

        # 1. Grab all mailto: links — most reliable source
        for href in parsed.hrefs:
            if href.lower().startswith('mailto:'):
                addr = href[7:].split('?')[0].strip().lower()
                if addr and _is_valid_email(addr):
                    collected.add(addr)

        # 2. Scan visible text for email patterns
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
    domains = fetch_business_domains(
        search_term,
        fallback_query=f'{industry} company business',
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
            for future in as_completed(futures, timeout=MAX_SCRAPE_TIMEOUT):
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
    except ConcurrentFuturesTimeout:
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
