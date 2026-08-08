import mongoose from "mongoose";
import { envConfig } from "../src/config/env-config";
import app from "../src/app";
import type { Request, Response } from "express";

let isConnected = false;

async function connectDB() {
  // Already connected
  if (isConnected && mongoose.connection.readyState === 1) return;

  if (!envConfig.database_url) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }

  await mongoose.connect(envConfig.database_url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log("MongoDB connected.");
}

// Each request waits for DB connection before being handled
const handler = async (req: Request, res: Response) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection failed:", (err as Error).message);
    res.status(500).json({ success: false, message: "Database connection failed." });
    return;
  }

  return app(req, res);
};

export default handler;
