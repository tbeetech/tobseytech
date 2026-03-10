import bcrypt from "bcryptjs";
import { storage } from "./storage";

/**
 * Ensures the primary admin user "tbeetech" exists in the database with
 * role="admin".  Called once at server startup after initStorage().
 *
 * Environment variables used:
 *   ADMIN_SEED_EMAIL     – email address for the seeded account (required)
 *   ADMIN_SEED_PASSWORD  – password for the seeded account (required)
 *
 * If the user already exists their role is promoted to "admin" and the
 * password / email are left unchanged.
 */

export async function ensureAdminUser(): Promise<void> {
  const username = "tbeetech";

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are not set. " +
        "Skipping admin user seed."
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
        console.log(`[seed] Admin user "${username}" already exists – nothing to do.`);
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
 * If no user with that email exists yet, the function is a no-op – the
 * promotion will happen automatically the next time the server starts
 * after the user has registered.
 */
export async function promoteAdminByEmail(email: string): Promise<void> {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`[seed] No user found with email "${email}" – skipping promotion.`);
      return;
    }
    if (user.role === "admin") {
      console.log(`[seed] User "${email}" is already an admin – nothing to do.`);
      return;
    }
    await storage.updateUserRole(user.id, "admin");
    console.log(`[seed] Promoted user "${email}" to admin.`);
  } catch (err) {
    console.error(`[seed] Failed to promote user "${email}" to admin:`, err);
  }
}
