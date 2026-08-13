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

export const createUserSchema = z.object({
  body: z.object({
    user_name: z.string().min(2, "Name must be at least 2 characters"),
    user_email: z.string().email("Invalid email address"),
    user_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    user_phone: z.string().optional(),
    user_role: z.enum(["user"]).default("user"),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    admin_name: z.string().min(2, "Name must be at least 2 characters"),
    admin_email: z.string().email("Invalid email address"),
    admin_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    admin_role: z.enum(["admin", "super_admin"]).default("admin"),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50),
    message: z
      .string()
      .min(5, "Message must be at least 5 characters")
      .max(200),
    type: z
      .enum(["info", "success", "warning", "error", "alert"])
      .default("info"),
  }),
});

export const sendUserNotificationSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50),
    message: z
      .string()
      .min(5, "Message must be at least 5 characters")
      .max(200),
    type: z
      .enum(["info", "success", "warning", "error", "alert"])
      .default("info"),
  }),
});
