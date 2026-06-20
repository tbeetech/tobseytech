import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } from "./env.js";

/**
 * Ensures the primary admin user "tbeetech" exists in the database with
 * role="admin".  Called once at server startup after initStorage().
 *
 * Environment variables used:
 *   ADMIN_SEED_EMAIL     â€“ email address for the seeded account (required)
 *   ADMIN_SEED_PASSWORD  â€“ initial password used only when creating the account
 *                          for the very first time (required)
 *
 * If the user already exists only the role is promoted to "admin" when needed.
 * The password is intentionally NOT overwritten on subsequent restarts so that
 * password changes made via the "Forgot Password" flow are preserved.
 */

export async function ensureAdminUser(): Promise<void> {
  const username = "tbeetech";
  const email = ADMIN_SEED_EMAIL;
  const password = ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn(
      '[seed] Skipping admin seed: set both ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD to create or sync the "tbeetech" admin user.'
    );
    return;
  }

  try {
    const existing = await storage.getUserByUsername(username);

    if (existing) {
      if (existing.role !== "admin") {
        await storage.updateUserRole(existing.id, "admin");
        console.log(`[seed] Promoted existing user "${username}" to admin.`);
      } else {
        console.log(`[seed] Admin user "${username}" is up-to-date â€“ nothing to do.`);
      }
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    await storage.createUser({
      username,
      email,
      password: hashed,
      role: "admin",
    });
    console.log(`[seed] Created admin user "${username}".`);
  } catch (err) {
    console.error("[seed] Failed to seed admin user:", err);
  }
}

/**
 * Promotes an existing user identified by email to role="admin".
 * Called once at server startup after initStorage().
 * If no user with that email exists yet, the function is a no-op â€“ the
 * promotion will happen automatically the next time the server starts
 * after the user has registered.
 */
export async function promoteAdminByEmail(email: string): Promise<void> {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`[seed] No user found with email "${email}" â€“ skipping promotion.`);
      return;
    }
    if (user.role === "admin") {
      console.log(`[seed] User "${email}" is already an admin â€“ nothing to do.`);
      return;
    }
    await storage.updateUserRole(user.id, "admin");
    console.log(`[seed] Promoted user "${email}" to admin.`);
  } catch (err) {
    console.error(`[seed] Failed to promote user "${email}" to admin:`, err);
  }
}

/**
 * Seeds 3 default published VlogPosts (the 3 starter YouTube videos) the first
 * time the server starts against an empty vlogs collection.  Idempotent â€” if
 * any vlog posts already exist the function returns immediately.
 */
export async function seedDefaultVlogs(): Promise<void> {
  try {
    const existing = await (storage as any).getVlogPosts();
    if (existing && existing.length > 0) return;

    const adminUser = await storage.getUserByUsername("admin").catch(() => null)
      || await storage.getUserByEmail(process.env.ADMIN_EMAIL || "admin@arcolytetech.com").catch(() => null);
    const authorId = adminUser?.id || "system";
    const authorName = adminUser?.username || "ARCOLYTE TECHNOLOGIES";

    const { insertVlogPostSchema } = await import("../shared/schema.js");

    const defaults = [
      {
        title: "The Future of AI in Software Development",
        slug: "future-of-ai-in-software-development",
        description: "Explore how artificial intelligence is transforming the way developers write code, debug applications, and architect systems. AI-assisted coding tools are dramatically increasing developer productivity. Machine learning models can now understand context and suggest meaningful code completions. The future holds even more exciting possibilities with autonomous code generation and intelligent debugging assistants.",
        embedUrl: "https://youtu.be/8h9j2rskP14",
        embedPlatform: "YouTube" as const,
        thumbnail: "https://img.youtube.com/vi/8h9j2rskP14/mqdefault.jpg",
        category: "AI & Development",
        tags: ["AI", "software development", "future tech"],
        seoTitle: "The Future of AI in Software Development | ARCOLYTE TECHNOLOGIES Vlog",
        seoDescription: "Explore how AI is transforming software development with intelligent coding tools.",
        published: true,
        authorId,
        authorName,
      },
      {
        title: "Top Dev Tools & Productivity Hacks for 2024",
        slug: "top-dev-tools-productivity-hacks-2024",
        description: "Discover the essential developer tools, keyboard shortcuts, and workflow optimizations that top engineers use to maximize their productivity. Modern IDEs with AI integration are changing how we write and review code. Cloud-based development environments eliminate setup friction for teams. Version control workflows and CI/CD pipelines are key to shipping quality code faster.",
        embedUrl: "https://www.youtube.com/watch?v=dXCCleAddEA",
        embedPlatform: "YouTube" as const,
        thumbnail: "https://img.youtube.com/vi/dXCCleAddEA/mqdefault.jpg",
        category: "Dev Tools",
        tags: ["productivity", "dev tools", "2024", "coding tips"],
        seoTitle: "Top Dev Tools & Productivity Hacks 2024 | ARCOLYTE TECHNOLOGIES Vlog",
        seoDescription: "Essential developer tools and productivity hacks used by top engineers in 2024.",
        published: true,
        authorId,
        authorName,
      },
      {
        title: "Tech Gadgets & Hardware Innovations That Matter",
        slug: "tech-gadgets-hardware-innovations",
        description: "A deep dive into the latest tech gadgets and hardware innovations shaping the developer and creator ecosystem. New processors are bringing unprecedented computing power to mobile devices. Ergonomic peripherals designed for long coding sessions reduce fatigue significantly. Smart home integrations and IoT devices are creating new opportunities for developers to build connected experiences.",
        embedUrl: "https://youtu.be/D_FCYsshMI4",
        embedPlatform: "YouTube" as const,
        thumbnail: "https://img.youtube.com/vi/D_FCYsshMI4/mqdefault.jpg",
        category: "Tech Gadgets",
        tags: ["gadgets", "hardware", "IoT", "tech"],
        seoTitle: "Tech Gadgets & Hardware Innovations | ARCOLYTE TECHNOLOGIES Vlog",
        seoDescription: "Latest tech gadgets and hardware innovations shaping the developer ecosystem.",
        published: true,
        authorId,
        authorName,
      },
    ];

    for (const vlog of defaults) {
      const data = insertVlogPostSchema.parse(vlog);
      await (storage as any).createVlogPost(data);
    }
    console.log("[seed] Seeded 3 default vlog posts");
  } catch (err) {
    console.error("[seed] Failed to seed default vlogs:", err);
  }
}
