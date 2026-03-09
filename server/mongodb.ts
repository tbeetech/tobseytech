import mongoose from "mongoose";

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

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  if (!listenersRegistered) {
    registerConnectionListeners();
    listenersRegistered = true;
  }

  await mongoose.connect(uri, {
    // Fail fast if the cluster is unreachable (default is 30 s)
    serverSelectionTimeoutMS: 10_000,
    // Abort a socket operation after this many ms of inactivity
    socketTimeoutMS: 45_000,
  });
  isConnected = true;
  console.log("Connected to MongoDB");
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
