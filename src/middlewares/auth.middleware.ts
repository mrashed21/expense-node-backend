import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../helpers/api-error";
import { verifyToken } from "../utils/jwt";
import { envConfig } from "../config/env-config";
import { User } from "../modules/user/user.model";
import { UserRole, UserStatus } from "../modules/user/user.interface";

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

export const checkAuth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined;

      if (req.cookies.accessToken) {
        token = req.cookies.accessToken;
      } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access. No token provided.");
      }

      const decoded = verifyToken(token, envConfig.jwt.access_secret);
      const userExists = await User.findById(decoded._id);

      if (!userExists || userExists.is_deleted || userExists.user_status !== UserStatus.ACTIVE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User account is suspended, deleted or non-existent.");
      }

      if (userExists.token_version !== decoded.token_version) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Session expired or logged out from all devices. Please log in again.");
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(userExists.user_role as UserRole)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden. You do not have permission to access this resource.");
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
