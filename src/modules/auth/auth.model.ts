import { Schema, model } from "mongoose";
import { IOtpDocument } from "./auth.interface";

const otpSchema = new Schema<IOtpDocument>(
  {
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp_code: {
      type: String,
      required: true,
    },
    otp_type: {
      type: String,
      enum: ["email_verify", "forgot_password"],
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
    is_used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user_email: 1, otp_type: 1, is_used: 1 });

export const Otp = model<IOtpDocument>("Otp", otpSchema);
