import mongoose from "mongoose";

// Hard-coded fallback MongoDB URI – used when the MONGODB_URI environment
// variable is not set.  Replace the placeholder credentials below with your
// actual Atlas username and password if you are not using an env file.
const FALLBACK_MONGODB_URI =
  "mongodb+srv://tobseytech:tobseytech2024@cluster0.mpmy7ir.mongodb.net/tobseytech?retryWrites=true&w=majority&appName=Cluster0";

// Resolve the URI: prefer the environment variable so that production
// deployments (Render, Vercel) can override the hard-coded default.
export const MONGODB_URI: string =
  process.env.MONGODB_URI || FALLBACK_MONGODB_URI;

const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 2_000;

let isConnected = false;
let listenersRegistered = false;

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
