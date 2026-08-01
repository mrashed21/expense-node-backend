import { Response } from "express";
import { envConfig } from "../config/env-config";

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: envConfig.env === "production",
    sameSite: envConfig.env === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: envConfig.env === "production",
    sameSite: envConfig.env === "production" ? "none" : "lax",
    expires: new Date(0),
  });
};
