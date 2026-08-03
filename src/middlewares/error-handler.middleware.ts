import { envConfig } from "@/config/env-config";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ErrorLog } from "../modules/admin/error-log.model";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((el: any) => el.message)
      .join(", ");
  } else if (err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field || "Field"} already exists.`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token has expired. Please refresh your session.";
  }

  // Asynchronously log unhandled / internal server errors
  if (statusCode === httpStatus.INTERNAL_SERVER_ERROR) {
    ErrorLog.create({
      path: req.originalUrl,
      method: req.method,
      message: message,
      stack: err.stack,
      user_id: req.user?._id || (req as any).admin?._id,
    }).catch(console.error); // Do not await, fire and forget
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: envConfig.env === "development" ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    statusCode: httpStatus.NOT_FOUND,
    message: `API Route Not Found: ${req.originalUrl}`,
  });
};
