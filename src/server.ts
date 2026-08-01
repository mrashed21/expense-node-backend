import mongoose from "mongoose";
import app from "./app";
import { envConfig } from "./config/env-config";

async function main() {
  try {
    if (!envConfig.database_url) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(envConfig.database_url);
    console.log("✅ Successfully connected to MongoDB database.");

    const server = app.listen(envConfig.port, () => {
      console.log(`🚀 Expense Tracker Backend Server running on port ${envConfig.port}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log("Server closed.");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      console.error("Unhandled Error:", error);
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      console.log("SIGTERM received");
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

main();
