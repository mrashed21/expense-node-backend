import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { envConfig } from "../config/env-config";
import ApiError from "../helpers/api-error";
import { AdminRole, AdminStatus } from "../modules/admin/admin.interface";
import { Admin } from "../modules/admin/admin.model";
import { UserRole, UserStatus } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        user_role: string;
        user_email?: string;
        token_version: number;
      };
    }
  }
}

const extractToken = (req: Request): string => {
  if (req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  throw new ApiError(
    httpStatus.UNAUTHORIZED,
    "Unauthorized access. No token provided.",
  );
};

export const checkAuth = (...requiredRoles: UserRole[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = extractToken(req);
      const decoded = verifyToken(token, envConfig.jwt.access_secret);
      const userExists = await User.findById(decoded._id)
        .select(
          "_id user_role user_email token_version is_deleted user_status email_verified",
        )
        .lean();

      if (
        !userExists ||
        userExists.is_deleted ||
        userExists.user_status !== UserStatus.ACTIVE
      ) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "User account is suspended, deleted or non-existent.",
        );
      }

      if (!userExists.email_verified) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Please verify your email address.",
        );
      }

      if (userExists.token_version !== decoded.token_version) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Session expired or logged out from all devices. Please log in again.",
        );
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(userExists.user_role as UserRole)
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden. You do not have permission to access this resource.",
        );
      }

      req.user = {
        _id: userExists._id.toString(),
        user_role: userExists.user_role,
        user_email: userExists.user_email,
        token_version: userExists.token_version,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkAdminAuth = (...requiredRoles: AdminRole[]) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token = extractToken(req);
      const decoded = verifyToken(token, envConfig.jwt.access_secret);

      if (!decoded.isAdmin) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Unauthorized. Not an admin token.",
        );
      }

      const adminExists = await Admin.findById(decoded._id)
        .select(
          "_id admin_role admin_email token_version is_deleted admin_status",
        )
        .lean();

      if (
        !adminExists ||
        adminExists.is_deleted ||
        adminExists.admin_status !== AdminStatus.ACTIVE
      ) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Admin account is suspended, deleted or non-existent.",
        );
      }

      if (adminExists.token_version !== decoded.token_version) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Session expired or logged out from all devices. Please log in again.",
        );
      }

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.includes(adminExists.admin_role as AdminRole)
      ) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden. You do not have permission to access this resource.",
        );
      }

      req.user = {
        _id: adminExists._id.toString(),
        user_role: adminExists.admin_role,
        user_email: adminExists.admin_email,
        token_version: adminExists.token_version,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const auth = checkAuth();
