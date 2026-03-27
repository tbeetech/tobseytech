import mongoose from "mongoose";
import { MONGODB_URI } from "./env.js";

const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 2_000;

let isConnected = false;
let listenersRegistered = false;

// A single shared promise for the underlying MongoClient.
// Reusing the same client for both mongoose and connect-mongo avoids a second
// connection to Atlas (important on the free M0 tier with its 500-connection
// limit) and ensures that if mongoose can reach the DB the session store can too.
let _clientPromise: Promise<mongoose.mongo.MongoClient> | null = null;

/**
 * Returns a promise that resolves to the underlying MongoClient once the
 * mongoose connection is established.  Used by connect-mongo so that the
 * session store shares the same connection pool as the application storage.
 */
export function getClientPromise(): Promise<mongoose.mongo.MongoClient> {
  if (!_clientPromise) {
    _clientPromise = connectToDatabase()
      .then(() => mongoose.connection.getClient())
      .catch((err) => {
        // Reset so the next call will retry.
        _clientPromise = null;
        throw err;
      });
  }
  return _clientPromise;
}

function registerConnectionListeners() {
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    isConnected = false;
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected — waiting for automatic reconnect…");
    isConnected = false;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
    isConnected = true;
  });
}

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;

  const uri = MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!listenersRegistered) {
    registerConnectionListeners();
    listenersRegistered = true;
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        // Give the cluster up to 30 s to respond during cold-start / scale-up
        serverSelectionTimeoutMS: 30_000,
        // Abort a socket operation after this many ms of inactivity
        socketTimeoutMS: 45_000,
        // Time limit for the initial TCP handshake
        connectTimeoutMS: 30_000,
      });
      isConnected = true;
      console.log(`Connected to MongoDB (attempt ${attempt})`);
      return;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed – retrying in ${delay}ms…`,
          (err as Error).message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${(lastError as Error).message}`
  );
}

// Close the connection gracefully when the process exits
let isShuttingDown = false;

async function disconnectGracefully() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB connection closed gracefully");
  }
}

process.on("SIGINT", async () => {
  await disconnectGracefully();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectGracefully();
  process.exit(0);
});

export default mongoose;
