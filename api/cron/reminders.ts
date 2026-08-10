import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import { envConfig } from "../../src/config/env-config";
import { runReminderJobs } from "../../src/modules/reminder/reminder.cron";

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(envConfig.database_url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  isConnected = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers["authorization"];
  const isVercelCron = authHeader === `Bearer ${envConfig.cron_secret}`;

  const customSecret = req.headers["x-cron-secret"];
  const isManualCall = customSecret === envConfig.cron_secret;

  if (!isVercelCron && !isManualCall) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await connectDB();
    await runReminderJobs();
    return res
      .status(200)
      .json({ success: true, message: "Reminders executed successfully." });
  } catch (error) {
    console.error("[CRON Reminders] Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
}
