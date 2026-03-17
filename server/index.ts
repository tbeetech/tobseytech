import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initStorage, storage } from "./storage";
import { ensureAdminUser, promoteAdminByEmail } from "./seed";

const app = express();

// Trust the first proxy hop (required on Render and other PaaS platforms that
// sit behind a reverse-proxy).  Without this:
//  • req.secure is always false → express-session never sends the `secure` cookie
//    in production, so sessions are lost after every request.
//  • req.ip is undefined → express-rate-limit throws / rate-limits all users
//    under the same "undefined" key, breaking per-IP limiting.
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use MongoDB-backed session storage when MONGODB_URI is available so that
// sessions survive server restarts (important on Render.com and other PaaS
// platforms that restart the process on every deploy or spin-up).
// Fall back to memorystore in development / when no MongoDB URI is configured.
const MemoryStore = createMemoryStore(session);

function buildSessionStore() {
  if (process.env.MONGODB_URI) {
    try {
      const store = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: "sessions",
        ttl: 7 * 24 * 60 * 60, // 7 days (in seconds)
        autoRemove: "native", // rely on MongoDB TTL index for clean-up
      });
      // Log connection errors without crashing – the store will automatically
      // retry; sessions already in-flight will fail gracefully.
      store.on("error", (err: Error) => {
        console.error("[session] MongoStore error:", err.message);
      });
      return store;
    } catch (err) {
      console.error("[session] Failed to create MongoStore, falling back to MemoryStore:", err);
    }
  }
  // Development fallback – prune expired entries every 24 h.
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

// CSRF protection: validate Origin header for state-mutating API requests
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initStorage();
  await ensureAdminUser();
  await promoteAdminByEmail("seyiolat3@gmail.com");

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error server-side for diagnostics
    console.error(err);

    // Only send a response if one hasn't been sent yet.  Re-throwing after
    // res.json() would cause finalhandler to call req.socket.destroy(),
    // resulting in ERR_CONNECTION_CLOSED on the client.
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
