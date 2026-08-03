import mongoose from "mongoose";
import { User } from "../src/modules/user/user.model";
import { Admin } from "../src/modules/admin/admin.model";
import { AdminRole, AdminStatus } from "../src/modules/admin/admin.interface";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function promoteAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <user_email>");
    process.exit(1);
  }

  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("DATABASE_URL or MONGO_URI is not set in .env");
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const user = await User.findOne({ user_email: email }).select("+user_password");
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ admin_email: email });
    if (existingAdmin) {
      console.error(`Admin with email ${email} already exists.`);
      process.exit(1);
    }

    await Admin.create({
      admin_name: user.user_name,
      admin_email: user.user_email,
      admin_password: user.user_password,
      admin_role: AdminRole.SUPER_ADMIN,
      admin_status: AdminStatus.ACTIVE,
    });

    console.log(`✅ Success! User ${email} has been copied to the Admin collection as a SUPER_ADMIN.`);
    process.exit(0);
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  }
}

promoteAdmin();
