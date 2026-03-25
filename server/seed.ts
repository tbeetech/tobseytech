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
 * password is synced to the current value of ADMIN_SEED_PASSWORD so that
 * updating the env var on Render (or locally) takes effect on the next restart.
 */

export async function ensureAdminUser(): Promise<void> {
  const username = "tbeetech";

  const email = process.env.ADMIN_SEED_EMAIL || "seyiolat3@gmail.com";
  const password = process.env.ADMIN_SEED_PASSWORD || "Tbeetech2024!";

  try {
    const existing = await storage.getUserByUsername(username);

    if (existing) {
      let changed = false;
      if (existing.role !== "admin") {
        await storage.updateUserRole(existing.id, "admin");
        console.log(`[seed] Promoted existing user "${username}" to admin.`);
        changed = true;
      }
      // Always sync the password so that a new ADMIN_SEED_PASSWORD takes effect
      // on the next server restart without requiring a manual DB update.
      const passwordMatches = await bcrypt.compare(password, existing.password);
      if (!passwordMatches) {
        const hashed = await bcrypt.hash(password, 12);
        await storage.updateUserPassword(existing.id, hashed);
        console.log(`[seed] Updated password for admin user "${username}".`);
        changed = true;
      }
      if (!changed) {
        console.log(`[seed] Admin user "${username}" is up-to-date – nothing to do.`);
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
