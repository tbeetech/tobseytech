import { randomBytes } from "crypto";

const GENERATED_SESSION_SECRET = randomBytes(32).toString("hex");

export const isProduction = process.env.NODE_ENV === "production";
export const MONGODB_URI = process.env.MONGODB_URI?.trim();
export const SESSION_SECRET = process.env.SESSION_SECRET?.trim() || GENERATED_SESSION_SECRET;
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
    const message =
      "ADMIN_DASHBOARD_PASSWORD is not configured. Admin dashboard password verification will be unavailable until it is set.";
    if (isProduction) {
      errors.push(message);
    } else {
      warnings.push(message);
    }
  }

  logConfigIssues("warn", warnings);
  logConfigIssues("error", errors);

  if (errors.length > 0) {
    throw new Error(
      `Invalid runtime environment configuration:\n- ${errors.join("\n- ")}`
    );
  }
}
