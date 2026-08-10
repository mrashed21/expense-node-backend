import { Document, Types } from "mongoose";

export enum AdminRole {
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum AdminStatus {
  ACTIVE = "active",
  INACTIVE = "deactive",
  BANNED = "banned",
  DELETED = "deleted",
}

export interface IAdmin {
  _id: Types.ObjectId;
  admin_name: string;
  admin_email: string;
  admin_password?: string;
  admin_role: AdminRole;
  admin_profile_image?: string;
  admin_status: AdminStatus;

  admin_phone?: string;
  admin_area?: string;
  admin_city?: string;
  admin_country?: string;

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

export interface IAdminDocument extends IAdmin, Document {}

export interface IAuditLog {
  _id: Types.ObjectId;
  admin_id: Types.ObjectId;
  action: string;
  target_id?: Types.ObjectId | string;
  details?: Record<string, any>;
  ip_address?: string;
  createdAt: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

export interface IErrorLog {
  _id: Types.ObjectId;
  path: string;
  method: string;
  message: string;
  stack?: string;
  user_id?: Types.ObjectId | string;
  timestamp: Date;
}

export interface IErrorLogDocument extends IErrorLog, Document {}
