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
import { storage, initStorage } from "../server/storage";
import { ensureAdminUser, promoteAdminByEmail } from "../server/seed";
import { registerApiRoutes } from "../server/routes";

const app = express();

// Trust the first proxy hop (required on Vercel's reverse-proxy infrastructure).
app.set("trust proxy", 1);

// Increase body size limit to 10 MB to accommodate base64-encoded cover images.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

const MemoryStore = createMemoryStore(session);

function buildSessionStore() {
  if (process.env.MONGODB_URI) {
    try {
      const store = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "tobseytech-secret-key",
    resave: false,
    saveUninitialized: false,
    store: buildSessionStore(),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

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
      const user = await storage.getUserByUsername(username);
      if (!user) return done(null, false, { message: "Incorrect username or password" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Incorrect username or password" });
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
    done(err);
  }
});

// Initialize storage and register routes once on cold start.
// Subsequent warm invocations resolve the already-settled promise instantly.
const ready = (async () => {
  await initStorage();
  await ensureAdminUser();
  if (process.env.ADMIN_SEED_EMAIL) {
    await promoteAdminByEmail(process.env.ADMIN_SEED_EMAIL);
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

// Export a handler that waits for initialization then delegates to the Express app.
export default async function handler(req: Request, res: Response) {
  await ready;
  return app(req, res);
}
