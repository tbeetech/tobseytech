import type { BlogPost } from "../shared/schema.js";

/**
 * Replace the default Open Graph and Twitter Card meta tags in the HTML
 * template with blog-post-specific values so that social-media crawlers
 * (which do NOT execute JavaScript) see the correct title, description,
 * and cover image when a blog link is shared.
 */
export function injectBlogMetaTags(
  html: string,
  post: BlogPost,
  baseUrl: string,
): string {
  const postUrl = `${baseUrl}/blog/${post.slug}`;
  const title = escapeHtml(post.title);
  const description = escapeHtml(post.excerpt);
  const image = post.coverImage ?? "https://i.pinimg.com/1200x/58/b9/9e/58b99ee7bfbbf7c0043a1950be716265.jpg";

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title} — TOBSEYTECH</title>`,
  );

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`,
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`,
  );

  // Replace og:type
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="article" />`,
  );

  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${postUrl}" />`,
  );

  // Replace og:image
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${image}" />`,
  );

  // Replace og:image:type — use jpeg for blog cover images and logo
  html = html.replace(
    /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image:type" content="image/jpeg" />`,
  );

  // Replace og:image:alt
  html = html.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image:alt" content="${title}" />`,
  );

  // Replace twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`,
  );

  // Replace twitter:description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`,
  );

  // Replace twitter:image
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${image}" />`,
  );

  // Replace twitter:image:alt
  html = html.replace(
    /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image:alt" content="${title}" />`,
  );

  return html;
}

/** Escape HTML special characters to prevent XSS in meta tag content. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
