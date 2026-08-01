import { Document, Types } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "deactive",
  BANNED = "banned",
  DELETED = "deleted"
}

export interface IUser {
  _id: Types.ObjectId;
  user_name: string;
  user_email: string;
  email_verified: boolean;
  user_phone?: string;
  phone_verified?: boolean;
  user_password?: string;
  user_role: UserRole;
  user_area?: string;
  user_city?: string;
  user_country?: string;
  user_profile_image?: string;
  user_status: UserStatus;
  
  currency: string;
  language: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  date_format: string;
  number_format: string;

  token_version: number;
  last_login?: Date;
  password_changed_at?: Date;
  
  is_deleted: boolean;
  deleted_at?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

export interface IJwtPayload {
  _id: string;
  user_role: string;
  user_email?: string;
  user_phone?: string;
  token_version: number;
}

export interface ILoginHistory {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  ip_address: string;
  user_agent: string;
  device_info: string;
  browser: string;
  location?: string;
  timestamp: Date;
}

export interface ILoginHistoryDocument extends ILoginHistory, Document {}
