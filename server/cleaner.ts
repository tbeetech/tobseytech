/**
 * cleaner.ts
 *
 * "Cleaner and Corrector" middleware — a mandatory filter between the news-
 * fetching bot and the database.
 *
 * Two operation modes:
 *
 * 1. Synchronous Filter (The Gate)
 *    Called inside botWorker.ts before every storage.createBlogPost() call.
 *    Intercepts raw RSS data and ensures only sanitised text reaches the DB.
 *
 * 2. Manual Audit (The Scanner)
 *    auditAndClean() — admin-triggered via POST /api/bot/audit.
 *    Iterates all existing DB entries and retroactively fixes any post that
 *    still contains HTML artifacts or mis-encoded characters.
 */

import type { IStorage } from "./storage.js";

// ─── HTML entity map ──────────────────────────────────────────────────────────

/** Named HTML entities that must be decoded in plain-text fields. */
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
  copy: "©",
  reg: "®",
  trade: "™",
  bull: "•",
  middot: "·",
  times: "×",
  divide: "÷",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  aacute: "á",
  agrave: "à",
  oacute: "ó",
  uacute: "ú",
  iacute: "í",
  ntilde: "ñ",
  ccedil: "ç",
};

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Decode HTML entities to their Unicode equivalents.
 * Handles named entities (e.g. &amp;), decimal (&#160;), and hex (&#x00A0;).
 */
export function decodeHtmlEntities(text: string): string {
  return text
    // Named entities
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => {
      const lower = name.toLowerCase();
      return NAMED_ENTITIES[lower] ?? match;
    })
    // Decimal numeric entities — e.g. &#160;
    .replace(/&#(\d+);/g, (_, num: string) =>
      String.fromCodePoint(parseInt(num, 10))
    )
    // Hexadecimal numeric entities — e.g. &#x00A0;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16))
    );
}

/** Strip every HTML tag from a string, collapsing the surrounding whitespace. */
function stripAllHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fully sanitise a plain-text field (title, excerpt, author name, etc.).
 * 1. Decode HTML entities
 * 2. Strip any stray HTML tags
 * 3. Normalise whitespace
 */
export function cleanTextField(raw: string): string {
  if (!raw) return raw;
  // First decode entities, then strip tags that might have been introduced,
  // then decode a second time in case decoding revealed more encoded text.
  const pass1 = decodeHtmlEntities(raw);
  const stripped = stripAllHtml(pass1);
  return decodeHtmlEntities(stripped);
}

/**
 * Fix common HTML artifacts in a *content* field that legitimately contains
 * HTML markup.  This helper is retained for ad-hoc use but is no longer
 * called by cleanPost or auditAndClean — those paths now use cleanTextField
 * to strip HTML entirely so content is stored as plain text for the Markdown
 * renderer on the frontend.
 *
 * When called it will:
 * - Resolve double-encoded entities (&amp;amp; → &amp;, etc.)
 * - Replace the most common typographic entity sequences with real Unicode
 *   characters so they render correctly even when the page's HTML parser is
 *   bypassed (e.g. in OG text or search snippets)
 * - Collapse excessive blank lines between block elements
 * - Trim leading/trailing whitespace
 */
export function cleanContentHtml(html: string): string {
  if (!html) return html;

  let out = html;

  // Fix double-encoded named entities (&amp;mdash; → &mdash;, etc.)
  out = out.replace(/&amp;([a-zA-Z]+;)/g, "&$1");
  // Fix double-encoded decimal entities (&amp;#160; → &#160;)
  out = out.replace(/&amp;(#\d+;)/g, "&$1");
  // Fix double-encoded hex entities (&amp;#x…; → &#x…;)
  out = out.replace(/&amp;(#x[0-9a-fA-F]+;)/gi, "&$1");

  // Replace typographic named entities with real Unicode characters so
  // readers see proper glyphs in all contexts.
  out = out.replace(/&mdash;/g, "—");
  out = out.replace(/&ndash;/g, "–");
  out = out.replace(/&hellip;/g, "…");
  out = out.replace(/&rsquo;/g, "\u2019");
  out = out.replace(/&lsquo;/g, "\u2018");
  out = out.replace(/&rdquo;/g, "\u201D");
  out = out.replace(/&ldquo;/g, "\u201C");
  out = out.replace(/&bull;/g, "•");
  out = out.replace(/&middot;/g, "·");
  out = out.replace(/&copy;/g, "©");
  out = out.replace(/&reg;/g, "®");
  out = out.replace(/&trade;/g, "™");
  out = out.replace(/&nbsp;/g, "\u00A0");

  // Collapse runs of more than two consecutive blank lines between elements
  out = out.replace(/(<\/(?:p|div|h[1-6]|ul|ol|li|blockquote)>)\s*\n{3,}/gi, "$1\n\n");

  return out.trim();
}

// ─── Source attribution stripper ─────────────────────────────────────────────

/**
 * Remove any source-attribution lines that the bot previously appended to
 * content.  Handles:
 *  - The separator + attribution block added by buildContent:
 *      \n\n---\nOriginally published by … Source: …
 *  - Standalone "Originally published by …" sentences anywhere in the text
 *  - "Read the original article" phrases (with or without a URL)
 *  - "Source: <url>" lines
 */
export function stripSourceAttribution(text: string): string {
  if (!text) return text;

  let out = text;

  // Remove the full block: optional blank lines + horizontal rule + attribution
  out = out.replace(/\s*\n\s*---\s*\n[\s\S]*?Originally published by[\s\S]*$/im, "");

  // Remove standalone "Originally published by …" sentences (to end of that line)
  out = out.replace(/Originally published by[^\n]*/gi, "");

  // Remove "Read the original article" links/phrases (to end of that line)
  out = out.replace(/Read the original article[^\n]*/gi, "");

  // Remove "Source: <anything>" lines
  out = out.replace(/^Source:\s*\S+[^\n]*/gim, "");

  // Collapse any resulting multiple blank lines and trim
  out = out.replace(/\n{3,}/g, "\n\n").trim();

  return out;
}

// ─── Public gate — clean a post before it enters the DB ──────────────────────

export interface PostTextFields {
  title: string;
  excerpt: string;
  content: string;
}

/**
 * Synchronous filter applied to every new post before it is written to the DB.
 *
 * - title   → full HTML strip + entity decode + whitespace normalise
 * - excerpt → same as title (excerpt is always plain text)
 * - content → HTML strip + entity decode + source-attribution removal
 */
export function cleanPost<T extends PostTextFields>(post: T): T {
  return {
    ...post,
    title: cleanTextField(post.title),
    excerpt: cleanTextField(post.excerpt),
    content: stripSourceAttribution(cleanTextField(post.content)),
  };
}

// ─── Manual audit — retroactively clean all existing DB posts ─────────────────

export interface AuditResult {
  total: number;
  cleaned: number;
  unchanged: number;
  errors: number;
}

/**
 * Iterate every blog post in the database and apply the cleaner.
 * Only posts where at least one field actually changed are updated,
 * avoiding unnecessary DB writes.
 *
 * @returns Summary counts for the admin dashboard response.
 */
export async function auditAndClean(store: IStorage): Promise<AuditResult> {
  const result: AuditResult = { total: 0, cleaned: 0, unchanged: 0, errors: 0 };

  // Fetch ALL posts (published + drafts) so nothing slips through
  const posts = await store.getBlogPosts(false);
  result.total = posts.length;

  for (const post of posts) {
    try {
      const cleanedTitle   = cleanTextField(post.title);
      const cleanedExcerpt = cleanTextField(post.excerpt);
      const cleanedContent = stripSourceAttribution(cleanTextField(post.content));

      const changed =
        cleanedTitle   !== post.title   ||
        cleanedExcerpt !== post.excerpt ||
        cleanedContent !== post.content;

      if (!changed) {
        result.unchanged++;
        continue;
      }

      await store.updateBlogPost(post.id, {
        title:   cleanedTitle,
        excerpt: cleanedExcerpt,
        content: cleanedContent,
      });

      result.cleaned++;
      console.log(`[cleaner] ✅ Cleaned post "${post.title}" (${post.id})`);
    } catch (err) {
      result.errors++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cleaner] ❌ Failed to clean post ${post.id}: ${msg}`);
    }
  }

  console.log(
    `[cleaner] Audit complete — total: ${result.total}, cleaned: ${result.cleaned}, unchanged: ${result.unchanged}, errors: ${result.errors}`
  );

  return result;
}
