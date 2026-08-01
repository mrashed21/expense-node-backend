import { Document } from "mongoose";

export interface IOtpDocument extends Document {
  user_email: string;
  otp_code: string;
  otp_type: "email_verify" | "forgot_password";
  expires_at: Date;
  is_used: boolean;
  createdAt: Date;
}
