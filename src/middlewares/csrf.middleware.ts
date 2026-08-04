import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import crypto from "crypto";

// Extend Express Request to include csrfToken
declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

export const generateCsrfToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false, // Must be readable by frontend to send in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  req.csrfToken = token;
  next();
};

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Allow safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (
    !cookieToken ||
    !headerToken ||
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string"
  ) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "CSRF token validation failed",
    });
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    const cookieBuffer = Buffer.from(cookieToken, "utf-8");
    const headerBuffer = Buffer.from(headerToken, "utf-8");

    if (
      cookieBuffer.length !== headerBuffer.length ||
      !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "CSRF token validation failed",
      });
    }
  } catch {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "CSRF token validation failed",
    });
  }

  next();
};
