import mongoose from "mongoose";
import { isProduction, MONGODB_URI } from "./env.js";

const MAX_RETRIES = isProduction ? 3 : 5;
const RETRY_BASE_DELAY_MS = 1_000;
const SERVER_SELECTION_TIMEOUT_MS = isProduction ? 10_000 : 30_000;
const CONNECT_TIMEOUT_MS = isProduction ? 10_000 : 30_000;
const SOCKET_TIMEOUT_MS = 45_000;
const MAX_POOL_SIZE = 10;
const MAX_IDLE_TIME_MS = 30_000;

let isConnected = false;
let listenersRegistered = false;
let connectionPromise: Promise<void> | null = null;

// A single shared promise for the underlying MongoClient.
// Reusing the same client for both mongoose and connect-mongo avoids a second
// connection to Atlas and keeps session storage on the same pool.
let _clientPromise: Promise<mongoose.mongo.MongoClient> | null = null;

export function getClientPromise(): Promise<mongoose.mongo.MongoClient> {
  if (!_clientPromise) {
    _clientPromise = connectToDatabase()
      .then(() => mongoose.connection.getClient())
      .catch((err) => {
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
    console.warn("MongoDB disconnected; waiting for automatic reconnect...");
    isConnected = false;
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
    isConnected = true;
  });
}

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  const uri = MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!listenersRegistered) {
    registerConnectionListeners();
    listenersRegistered = true;
  }

  connectionPromise = (async () => {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
          socketTimeoutMS: SOCKET_TIMEOUT_MS,
          connectTimeoutMS: CONNECT_TIMEOUT_MS,
          maxPoolSize: MAX_POOL_SIZE,
          minPoolSize: 0,
          maxIdleTimeMS: MAX_IDLE_TIME_MS,
        });
        isConnected = true;
        console.log(`Connected to MongoDB (attempt ${attempt})`);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(
            `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed; retrying in ${delay}ms...`,
            (err as Error).message
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Failed to connect to MongoDB after ${MAX_RETRIES} attempts: ${(lastError as Error).message}`
    );
  })();

  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

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
