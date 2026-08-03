import { Schema, model } from "mongoose";
import { IUserDocument, UserRole, UserStatus } from "./user.interface";

const userSchema = new Schema<IUserDocument>(
  {
    user_name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name is too short"],
      maxlength: [100, "Name is too long"],
    },
    user_email: {
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
    email_verified: {
      type: Boolean,
      default: false,
    },
    user_phone: {
      type: String,
      trim: true,
      default: undefined,
    },
    phone_verified: {
      type: Boolean,
      default: false,
    },
    user_password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password is too short"],
      select: false,
    },
    user_role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    user_area: {
      type: String,
      trim: true,
      default: "",
    },
    user_city: {
      type: String,
      trim: true,
      default: "",
    },
    user_country: {
      type: String,
      trim: true,
      default: "",
    },
    user_profile_image: {
      type: String,
      default: null,
    },
    user_status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
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
    two_factor_enabled: {
      type: Boolean,
      default: false,
    },
    two_factor_secret: {
      type: String,
      select: false,
    },
    two_factor_recovery_codes: {
      type: [String],
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.index(
  { user_phone: 1 },
  { unique: true, sparse: true }
);
userSchema.index({ is_deleted: 1, user_status: 1 });

export const User = model<IUserDocument>("User", userSchema);
