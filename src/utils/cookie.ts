import { envConfig } from "@/config/env-config";
import { Response } from "express";

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

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: envConfig.env === "production",
    sameSite: envConfig.env === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

export const clearAccessTokenCookie = (res: Response): void => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: envConfig.env === "production",
    sameSite: envConfig.env === "production" ? "none" : "lax",
    expires: new Date(0),
  });
};
