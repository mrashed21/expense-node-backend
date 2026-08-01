import { Schema, model, Document } from "mongoose";

export interface IOtpDocument extends Document {
  user_email: string;
  otp_code: string;
  otp_type: "email_verify" | "forgot_password";
  expires_at: Date;
  is_used: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    user_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
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
  }
);

otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<IOtpDocument>("Otp", otpSchema);
