import type { BlogPost, VlogPost } from "../shared/schema.js";

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
  const image = resolveSocialImageUrl(post.coverImage, baseUrl);

  return injectMetaTags(html, { title, description, image, url: postUrl, type: "article" });
}

/**
 * Replace the default Open Graph and Twitter Card meta tags with vlog-specific
 * values so that social-media crawlers see the correct info when a vlog link
 * is shared.
 */
export function injectVlogMetaTags(
  html: string,
  vlog: VlogPost,
  baseUrl: string,
): string {
  const vlogUrl = `${baseUrl}/vlog/${vlog.slug}`;
  const title = escapeHtml(vlog.seoTitle ?? vlog.title ?? "Untitled Vlog");
  const description = escapeHtml(vlog.seoDescription ?? vlog.description ?? "");
  const image = resolveSocialImageUrl(vlog.thumbnail, baseUrl);

  return injectMetaTags(html, { title, description, image, url: vlogUrl, type: "video.other" });
}

/** Core helper — replaces all OG/Twitter meta tags in the template. */
function injectMetaTags(
  html: string,
  { title, description, image, url, type }: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
  },
): string {

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
    `<meta property="og:type" content="${type}" />`,
  );

  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );

  // Replace og:image
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${image}" />`,
  );

  // Replace og:image:secure_url
  html = html.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image:secure_url" content="${image}" />`,
  );

  // Replace og:image:type — detect from the image URL extension
  const imageType = image.match(/\.png(\?|$)/i)
      ? "image/png"
      : image.match(/\.webp(\?|$)/i)
        ? "image/webp"
      : "image/jpeg";
  html = html.replace(
    /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image:type" content="${imageType}" />`,
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

function resolveSocialImageUrl(rawImage: string | null | undefined, baseUrl: string): string {
  const fallback = `${baseUrl}/og-image.png`;
  if (!rawImage) return fallback;

  const image = rawImage.trim();
  if (!image || image.startsWith("data:")) return fallback;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("//")) {
    return `https:${image}`;
  }

  if (image.startsWith("/")) {
    return `${baseUrl}${image}`;
  }

  return `${baseUrl}/${image}`;
}
