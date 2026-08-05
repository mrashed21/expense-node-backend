import { Schema, model } from "mongoose";
import { AdminRole, AdminStatus, IAdminDocument } from "./admin.interface";

const adminSchema = new Schema<IAdminDocument>(
  {
    admin_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name is too short"],
      maxlength: [100, "Name is too long"],
    },
    admin_email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email address",
      },
    },
    admin_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password is too short"],
      select: false,
    },
    admin_role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.ADMIN,
    },
    admin_profile_image: {
      type: String,
      default: null,
    },
    admin_status: {
      type: String,
      enum: Object.values(AdminStatus),
      default: AdminStatus.ACTIVE,
    },
    admin_phone: {
      type: String,
      trim: true,
      default: undefined,
    },
    admin_area: {
      type: String,
      trim: true,
      default: "",
    },
    admin_city: {
      type: String,
      trim: true,
      default: "",
    },
    admin_country: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    date_format: {
      type: String,
      default: "YYYY-MM-DD",
    },
    number_format: {
      type: String,
      default: "en-US",
    },
    token_version: {
      type: Number,
      default: 0,
    },
    last_login: {
      type: Date,
      default: null,
    },
    password_changed_at: {
      type: Date,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

adminSchema.index({ is_deleted: 1 });

export const Admin = model<IAdminDocument>("Admin", adminSchema);
