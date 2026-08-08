import mongoose from "mongoose";
import { envConfig } from "../src/config/env-config";
import app from "../src/app";

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!envConfig.database_url) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  await mongoose.connect(envConfig.database_url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log("MongoDB connected.");
}

// Connect on cold start
connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err.message);
});

export default app;
