/**
 * MongoDB connection module — written from scratch.
 *
 * Provides a single shared mongoose connection for both the application storage
 * layer and the connect-mongo session store.  Using one connection pool avoids
 * exhausting Atlas free-tier connection limits.
 */

import mongoose from "mongoose";

// ─── Connection state ────────────────────────────────────────────────────────

/** True once mongoose.connect() has resolved successfully. */
let connected = false;

/**
 * Cached promise that resolves to the underlying MongoClient.
 * Shared between the session store and application storage so they reuse
 * the same connection pool.
 */
let clientPromiseCache: Promise<mongoose.mongo.MongoClient> | null = null;

// ─── Event listeners ─────────────────────────────────────────────────────────

// Register listeners exactly once.
let listenersAdded = false;
function ensureListeners() {
  if (listenersAdded) return;
  listenersAdded = true;

  mongoose.connection.on("error", (err: Error) => {
    console.error("[db] MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected — automatic reconnect in progress…");
    connected = false;
    // Reset clientPromiseCache so the next call to getClientPromise() re-derives
    // a fresh MongoClient from the re-established connection.
    clientPromiseCache = null;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[db] MongoDB reconnected");
    connected = true;
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Connect to MongoDB.  If already connected this is a no-op.
 * Retries up to 5 times with exponential back-off before throwing.
 */
export async function connectToDatabase(): Promise<void> {
  if (connected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      "[db] MONGODB_URI environment variable is not set. " +
        "Please configure it in your hosting dashboard."
    );
  }

  ensureListeners();

  const MAX_ATTEMPTS = 5;
  const BASE_DELAY_MS = 2_000;

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      // If mongoose already has an active connection (e.g. after a
      // disconnect/reconnect cycle), re-use it without calling connect() again.
      if (mongoose.connection.readyState === 1) {
        connected = true;
        return;
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30_000,
        socketTimeoutMS:          45_000,
        connectTimeoutMS:         30_000,
      });

      connected = true;
      console.log(`[db] Connected to MongoDB (attempt ${attempt}/${MAX_ATTEMPTS})`);
      return;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_ATTEMPTS) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[db] Connection attempt ${attempt}/${MAX_ATTEMPTS} failed — ` +
            `retrying in ${delay}ms… (${msg})`
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(`[db] Failed to connect to MongoDB after ${MAX_ATTEMPTS} attempts: ${msg}`);
}

/**
 * Returns a Promise that resolves to the underlying MongoClient once the
 * connection is established.  Used by connect-mongo so that the session store
 * shares the same connection pool as application storage.
 */
export function getClientPromise(): Promise<mongoose.mongo.MongoClient> {
  if (!clientPromiseCache) {
    clientPromiseCache = connectToDatabase()
      .then(() => mongoose.connection.getClient())
      .catch((err) => {
        clientPromiseCache = null; // allow retry on next call
        throw err;
      });
  }
  return clientPromiseCache;
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("[db] MongoDB connection closed gracefully");
    }
  } catch (err) {
    console.error("[db] Error during graceful shutdown:", err instanceof Error ? err.message : err);
  }
}

process.once("SIGINT",  () => shutdown().then(() => process.exit(0)));
process.once("SIGTERM", () => shutdown().then(() => process.exit(0)));

export default mongoose;
