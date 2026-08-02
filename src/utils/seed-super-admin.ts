import bcrypt from "bcrypt";
import { Admin } from "../modules/admin/admin.model";
import { AdminRole, AdminStatus } from "../modules/admin/admin.interface";
import { log } from "../server";

export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = "super-admin@expense.com";
    const existingSuperAdmin = await Admin.findOne({ admin_email: superAdminEmail });

    if (existingSuperAdmin) {
      log.info("Super admin already exists, skipping insertion.");
      return;
    }

    const hashedPassword = await bcrypt.hash("superadmin", 12);

    await Admin.create({
      admin_name: "Super Admin",
      admin_email: superAdminEmail,
      admin_password: hashedPassword,
      admin_role: AdminRole.SUPER_ADMIN,
      admin_status: AdminStatus.ACTIVE,
    });

    log.success("Super admin created successfully.");
  } catch (error) {
    log.error(`Error seeding super admin: ${(error as Error).message}`);
  }
};
