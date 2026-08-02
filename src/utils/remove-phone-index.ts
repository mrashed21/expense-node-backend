import { envConfig } from "@/config/env-config";
import mongoose from "mongoose";

async function removePhoneIndex() {
  try {
    await mongoose.connect(envConfig.database_url);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not established");
      process.exit(1);
    }
    const collection = db.collection("users");

    // Check existing indexes
    const indexes = await collection.indexes();
    const phoneIndex = indexes.find(
      (i) => i.name === "user_phone_1" || (i.key && i.key.user_phone === 1),
    );

    if (phoneIndex && phoneIndex.name) {
      console.log(`Dropping index: ${phoneIndex.name}`);
      await collection.dropIndex(phoneIndex.name);
      console.log("Index dropped successfully.");
    } else {
      console.log("No user_phone index found.");
    }
  } catch (error) {
    console.error("Error checking/dropping index:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

removePhoneIndex();
