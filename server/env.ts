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
    const message =
      "MONGODB_URI is not configured. Development will fall back to in-memory storage; production must configure MongoDB to avoid data and session loss.";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  if (!process.env.SESSION_SECRET?.trim()) {
    const message =
      "SESSION_SECRET is not configured. Development will use a generated per-process secret; production must set a long random secret.";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  const hasAdminSeedEmail = Boolean(ADMIN_SEED_EMAIL);
  const hasAdminSeedPassword = Boolean(ADMIN_SEED_PASSWORD);
  if (hasAdminSeedEmail !== hasAdminSeedPassword) {
    const message =
      "ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must either both be set or both be omitted.";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
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

  if (isProduction) {
    throw new Error("SESSION_SECRET is required in production");
  }

  return randomBytes(32).toString("hex");
}
