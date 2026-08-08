import { envConfig } from "../config/env-config";
import { CookieOptions, Response } from "express";

const isProduction = envConfig.env === "production";

/**
 * Shared base cookie options for all auth cookies.
 */
const getBaseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
});

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    ...getBaseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie("refreshToken", "", {
    ...getBaseCookieOptions(),
    expires: new Date(0),
  });
};

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    ...getBaseCookieOptions(),
    maxAge: 60 * 60 * 1000, // 1 hour
  });
};

export const clearAccessTokenCookie = (res: Response): void => {
  res.cookie("accessToken", "", {
    ...getBaseCookieOptions(),
    expires: new Date(0),
  });
};

export const setDeviceIdCookie = (res: Response, deviceId: string): void => {
  res.cookie("deviceId", deviceId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
};

export const clearDeviceIdCookie = (res: Response): void => {
  res.cookie("deviceId", "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    expires: new Date(0),
  });
};
