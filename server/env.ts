import { randomBytes } from "crypto";

export const isProduction = process.env.NODE_ENV === "production";
export const MONGODB_URI = process.env.MONGODB_URI?.trim();
export const ADMIN_SEED_EMAIL = process.env.ADMIN_SEED_EMAIL?.trim();
export const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD?.trim();
export const ADMIN_DASHBOARD_PASSWORD = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();

function logConfigIssues(level: "warn" | "error", issues: string[]) {
  for (const issue of issues) {
    console[level](`[config] ${issue}`);
  }
}

export function validateRuntimeEnv(): void {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!MONGODB_URI) {
    errors.push("MONGODB_URI is not configured. Configure your MongoDB Atlas connection string before starting the server.");
  }

  if (!process.env.SESSION_SECRET?.trim()) {
    warnings.push(
      "SESSION_SECRET is not configured. A random per-process secret will be used — all sessions will be invalidated on every server restart. Set a long random secret in your host's environment variables for persistent sessions."
    );
  }

  const hasAdminSeedEmail = Boolean(ADMIN_SEED_EMAIL);
  const hasAdminSeedPassword = Boolean(ADMIN_SEED_PASSWORD);
  if (hasAdminSeedEmail !== hasAdminSeedPassword) {
    warnings.push(
      "ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD should either both be set or both be omitted. Admin account seeding will be skipped until both are configured."
    );
  }

  if (!ADMIN_DASHBOARD_PASSWORD) {
    // Warn but do not block startup — the /api/admin/verify-password route
    // already returns 503 when this env var is absent, so missing it should
    // not prevent the auth and other API endpoints from working.
    warnings.push(
      "ADMIN_DASHBOARD_PASSWORD is not configured. Admin dashboard password verification will be unavailable until it is set."
    );
  }

  logConfigIssues("warn", warnings);
  logConfigIssues("error", errors);

  if (errors.length > 0) {
    throw new Error(
      `Invalid runtime environment configuration:\n- ${errors.join("\n- ")}`
    );
  }
}

export function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  // No secret configured — generate a random one.
  // validateRuntimeEnv() already warned about this at startup.
  return randomBytes(32).toString("hex");
}
