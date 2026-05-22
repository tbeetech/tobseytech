import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";
import { storage } from "./storage.js";
import { injectBlogMetaTags, injectVlogMetaTags, injectRootMetaTags } from "./ogTags.js";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Inject blog-specific OG meta tags for social media crawlers
      const blogSlug = extractBlogSlug(url);
      if (blogSlug) {
        try {
          const post = await storage.getBlogPostBySlug(blogSlug);
          if (post && post.published) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            template = injectBlogMetaTags(template, post, baseUrl);
          }
        } catch {
          // non-fatal — serve template with default meta tags
        }
      }

      // Inject vlog-specific OG meta tags for social media crawlers
      const vlogSlug = extractVlogSlug(url);
      if (vlogSlug) {
        try {
          const vlog = await (storage as any).getVlogPostBySlug(vlogSlug);
          if (vlog && vlog.published) {
            const baseUrl = `${req.protocol}://${req.get("host")}`;
            template = injectVlogMetaTags(template, vlog, baseUrl);
          }
        } catch {
          // non-fatal — serve template with default meta tags
        }
      }

      // For all other routes (including root), fix the hardcoded domain in
      // OG/Twitter image tags so they resolve correctly on any hostname.
      if (!blogSlug && !vlogSlug) {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        template = injectRootMetaTags(template, baseUrl);
      }

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Pre-read and cache the index.html so all per-request OG-injection reads
  // go to memory instead of disk, avoiding repeated file-system access in the
  // catch-all handler below.
  let indexHtmlCache: string | null = null;
  async function getIndexHtml(htmlPath: string): Promise<string> {
    if (!indexHtmlCache) {
      indexHtmlCache = await fs.promises.readFile(htmlPath, "utf-8");
    }
    return indexHtmlCache;
  }

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    const htmlPath = path.resolve(distPath, "index.html");

    // Inject blog-specific OG meta tags for social media crawlers
    const blogSlug = extractBlogSlug(req.originalUrl);
    if (blogSlug) {
      try {
        const post = await storage.getBlogPostBySlug(blogSlug);
        if (post && post.published) {
          let html = await getIndexHtml(htmlPath);
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          html = injectBlogMetaTags(html, post, baseUrl);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
      } catch {
        // non-fatal — serve default index.html
      }
    }

    // Inject vlog-specific OG meta tags for social media crawlers
    const vlogSlug = extractVlogSlug(req.originalUrl);
    if (vlogSlug) {
      try {
        const vlog = await (storage as any).getVlogPostBySlug(vlogSlug);
        if (vlog && vlog.published) {
          let html = await getIndexHtml(htmlPath);
          const baseUrl = `${req.protocol}://${req.get("host")}`;
          html = injectVlogMetaTags(html, vlog, baseUrl);
          return res.status(200).set({ "Content-Type": "text/html" }).end(html);
        }
      } catch {
        // non-fatal — serve default index.html
      }
    }

    // For all other routes (including root), fix the hardcoded domain in
    // OG/Twitter image tags so they resolve correctly on any hostname.
    {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const html = injectRootMetaTags(await getIndexHtml(htmlPath), baseUrl);
      return res.status(200).set({ "Content-Type": "text/html" }).end(html);
    }
  });
}

/** Extract the blog slug from a URL path like /blog/my-post-slug */
function extractBlogSlug(url: string): string | null {
  const match = url.match(/^\/blog\/([^/?#]+)/);
  // Exclude known non-slug paths
  if (!match || match[1] === "new" || match[1] === "edit" || match[1] === "slug") {
    return null;
  }
  return decodeURIComponent(match[1]);
}

/** Extract the vlog slug from a URL path like /vlog/my-vlog-slug */
function extractVlogSlug(url: string): string | null {
  const match = url.match(/^\/vlog\/([^/?#]+)/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}
