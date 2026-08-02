import mongoose from "mongoose";
import { User } from "../src/modules/user/user.model";
import { UserRole } from "../src/modules/user/user.interface";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function promoteAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx ts-node scripts/promote-admin.ts <user_email>");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ user_email: email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.user_role = UserRole.ADMIN;
    await user.save();

    console.log(`✅ Success! User ${email} has been promoted to ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  }
}

promoteAdmin();
