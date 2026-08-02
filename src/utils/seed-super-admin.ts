import { AdminRole, AdminStatus } from "@/modules/admin/admin.interface";
import { Admin } from "@/modules/admin/admin.model";
import bcrypt from "bcrypt";
export const seedSuperAdmin = async () => {
  try {
    const superAdminEmail = "super-admin@expense.com";
    const existingSuperAdmin = await Admin.findOne({
      admin_email: superAdminEmail,
    });

    if (existingSuperAdmin) {
      console.log("Super admin already exists, skipping insertion.");
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

    console.log("Super admin created successfully.");
  } catch (error) {
    console.error(`Error seeding super admin: ${(error as Error).message}`);
  }
};
