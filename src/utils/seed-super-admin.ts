import bcrypt from "bcrypt";
import { User } from "../modules/user/user.model";
import { UserRole, UserStatus } from "../modules/user/user.interface";
import { log } from "../server";

export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = "super-admin@expense.com";
    const existingSuperAdmin = await User.findOne({ user_email: superAdminEmail });

    if (existingSuperAdmin) {
      log.info("Super admin already exists, skipping insertion.");
      return;
    }

    const hashedPassword = await bcrypt.hash("superadmin", 12);

    await User.create({
      user_name: "Super Admin",
      user_email: superAdminEmail,
      user_password: hashedPassword,
      user_role: UserRole.SUPER_ADMIN,
      user_status: UserStatus.ACTIVE,
      email_verified: true,
      phone_verified: true,
    });

    log.success("Super admin created successfully.");
  } catch (error) {
    log.error(`Error seeding super admin: ${(error as Error).message}`);
  }
};
