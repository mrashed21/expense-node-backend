import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import crypto from "crypto";

export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrfToken", token, {
    httpOnly: false, // Must be readable by frontend to send in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  // attach to req so controller can optionally return it in JSON
  (req as any).csrfToken = token;
  next();
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Allow safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(httpStatus.FORBIDDEN).json({
      success: false,
      message: "CSRF token validation failed",
    });
  }

  next();
};
