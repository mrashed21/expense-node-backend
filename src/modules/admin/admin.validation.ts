import { z } from "zod";

export const adminLoginSchema = z.object({
  body: z.object({
    admin_email: z.string().email("Invalid email address"),
    admin_password: z.string().min(1, "Password is required"),
  }),
});

export const updateAdminStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "deactive", "banned"]),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "deactive", "banned"]),
  }),
});
