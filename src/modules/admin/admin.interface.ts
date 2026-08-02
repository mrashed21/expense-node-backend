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

  token_version: number;
  last_login?: Date;
  password_changed_at?: Date;

  is_deleted: boolean;
  deleted_at?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminDocument extends IAdmin, Document {}
