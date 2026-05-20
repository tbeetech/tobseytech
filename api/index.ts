/**
 * Vercel Serverless Function entry point.
 *
 * This file adapts the Express application for Vercel's serverless runtime.
 * It replicates the middleware setup from server/index.ts and uses
 * registerApiRoutes (routes only, no HTTP/WebSocket server) instead of
 * registerRoutes.
 *
 * NOTE: Real-time WebSocket chat is NOT available in this serverless deployment.
 * All other features (auth, blog, profiles, messaging via polling, etc.) work normally.
 */
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage, initStorage } from "../server/storage.js";
import { ensureAdminUser, promoteAdminByEmail } from "../server/seed.js";
import { registerApiRoutes } from "../server/routes.js";
import { getClientPromise } from "../server/mongodb.js";
import {
  ADMIN_SEED_EMAIL,
  getSessionSecret,
  MONGODB_URI,
  validateRuntimeEnv,
} from "../server/env.js";

const app = express();

// Trust the first proxy hop (required on Vercel's reverse-proxy infrastructure).
app.set("trust proxy", 1);

// Increase body size limit to 10 MB to accommodate base64-encoded cover images.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

const MemoryStore = createMemoryStore(session);
let sessionMiddleware: ReturnType<typeof session> | null = null;

function buildSessionStore() {
  if (MONGODB_URI) {
    try {
      const store = MongoStore.create({
        // Reuse the same MongoClient that mongoose uses instead of opening a
        // second connection.  This prevents Atlas free-tier connection exhaustion
        // and guarantees the session store is available whenever the DB is.
        clientPromise: getClientPromise(),
        collectionName: "sessions",
        ttl: 7 * 24 * 60 * 60, // 7 days (in seconds)
        autoRemove: "native",
      });
      store.on("error", (err: Error) => {
        console.error("[session] MongoStore error:", err.message);
      });
      return store;
    } catch (err) {
      console.error("[session] Failed to create MongoStore, falling back to MemoryStore:", (err as Error).message ?? err);
    }
  }
  return new MemoryStore({ checkPeriod: 86400000 });
}

function getSessionMiddleware() {
  if (!sessionMiddleware) {
    sessionMiddleware = session({
      name: "tobseytech.sid",
      secret: getSessionSecret(),
      proxy: true,
      resave: false,
      saveUninitialized: false,
      store: buildSessionStore(),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    });
  }
  return sessionMiddleware;
}

app.use((req, res, next) => getSessionMiddleware()(req, res, next));

app.use(passport.initialize());
app.use(passport.session());

// CSRF protection: validate Origin header for state-mutating API requests.
app.use((req: Request, res: Response, next: NextFunction) => {
  const mutatingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (req.path.startsWith("/api") && mutatingMethods.includes(req.method)) {
    const origin = req.get("origin");
    const host = req.get("host");
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return res.status(403).json({ message: "Forbidden: cross-origin request" });
        }
      } catch {
        return res.status(403).json({ message: "Forbidden: invalid origin" });
      }
    }
  }
  next();
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Allow login via username or email
      const user =
        (await storage.getUserByUsername(username)) ||
        (await storage.getUserByEmail(username));
      if (!user) return done(null, false, { message: "Incorrect username/email or password" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect username/email or password" });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[auth] Failed to deserialize session user:", message);
    done(null, false);
  }
});

// Initialize storage and register routes once on cold start.
// Subsequent warm invocations resolve the already-settled promise instantly.
const ready = (async () => {
  validateRuntimeEnv();
  await initStorage();
  await ensureAdminUser();
  if (ADMIN_SEED_EMAIL) {
    await promoteAdminByEmail(ADMIN_SEED_EMAIL);
  }
  await registerApiRoutes(app);

  // Error handler must be registered after all routes.
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });
})();

// Prevent the rejected promise from becoming an unhandled rejection, which
// terminates the process in Node.js >= 15 and causes Vercel to return its own
// HTML error page instead of our JSON response.  The handler below still
// awaits `ready` and catches the rejection to return a proper 503.
ready.catch(() => {});

// Catch any unhandled promise rejections that escape route handlers
// (Express 4 does not automatically forward rejected async handler promises).
// Without this, Node.js 15+ terminates the process, causing Vercel to return
// FUNCTION_INVOCATION_FAILED instead of our JSON error responses.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection] Unhandled promise rejection:", reason);
});

// Vercel Hobby plan enforces a 10-second execution limit per invocation.
// This safety timeout fires just before that limit and returns a proper JSON
// 503 so Vercel never has to terminate the function with FUNCTION_INVOCATION_FAILED.
const VERCEL_SAFETY_TIMEOUT_MS = process.env.VERCEL ? 9_000 : 0;

// Export a handler that waits for initialization then delegates to the Express app.
// If initialization failed (e.g. missing required env vars), return a clear 503
// instead of leaking an unhandled rejection that Vercel turns into a generic 500.
export default async function handler(req: Request, res: Response) {
  try {
    await ready;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server initialization failed";
    console.error("[handler] Initialization error:", message);
    if (!res.headersSent) {
      res.status(503).json({ message: "Service unavailable: server failed to initialize. Check environment variable configuration." });
    }
    return;
  }
  const rewrittenPath = req.query?.path;
  if (typeof rewrittenPath === "string" && rewrittenPath.length > 0) {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`);
    const params = new URLSearchParams(url.search);
    params.delete("path");
    const suffix = params.toString();
    req.url = `/api/${rewrittenPath}${suffix ? `?${suffix}` : ""}`;
  }

  // Await the response being fully sent before resolving the handler Promise.
  // Without this, the async handler resolves immediately (app returns undefined),
  // and Vercel can close the invocation before Express finishes its async
  // middleware chain, causing FUNCTION_INVOCATION_FAILED.
  return new Promise<void>((resolve) => {
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;

    const done = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      resolve();
    };

    res.on("finish", done);
    res.on("close", done);

    // Safety net: if Express doesn't send a response before the Vercel timeout
    // fires, send a 503 so the invocation ends cleanly instead of being killed.
    if (VERCEL_SAFETY_TIMEOUT_MS > 0) {
      safetyTimer = setTimeout(() => {
        console.error("[handler] Safety timeout reached; sending 503 to avoid FUNCTION_INVOCATION_FAILED");
        if (!res.headersSent) {
          res.status(503).json({ message: "Request timed out — the database may be temporarily unavailable. Please try again." });
        }
        resolve();
      }, VERCEL_SAFETY_TIMEOUT_MS);
    }

    app(req, res);
  });
}
