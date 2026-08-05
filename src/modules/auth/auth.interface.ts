import { Document } from "mongoose";

export interface IOtpDocument extends Document {
  user_email: string;
  otp_code: string;
  otp_type: "email_verify" | "forgot_password";
  expires_at: Date;
  is_used: boolean;
  createdAt: Date;
}

export interface IRegisterPayload {
  user_name: string;
  user_email: string;
  user_password: string;
  user_phone?: string;
  user_area?: string;
  user_city?: string;
  user_country?: string;
}

export interface ILoginPayload {
  user_email: string;
  user_password: string;
}

export interface IResetPasswordPayload {
  user_email: string;
  otp_code: string;
  new_password: string;
}

export interface IVerifyLogin2FAPayload {
  tempToken: string;
  code: string;
}

export interface IClientInfo {
  ip: string;
  userAgent: string;
  deviceId?: string;
}

export interface IFinalizeLoginResult {
  user: {
    _id: string;
    user_name: string;
    user_email: string;
    email_verified: boolean;
    user_role: string;
    user_profile_image?: string;
    user_phone?: string;
    user_area?: string;
    user_city?: string;
    user_country?: string;
    currency: string;
    theme: string;
  };
  accessToken: string;
  refreshToken: string;
  deviceId: string;
}

export interface I2FARequiredResult {
  requires2FA: true;
  tempToken: string;
}

export type ILoginResult = IFinalizeLoginResult | I2FARequiredResult;
