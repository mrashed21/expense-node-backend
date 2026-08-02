import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error: any) {
      const errorMessage = error?.errors
        ? error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ")
        : error.message;

      res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: errorMessage,
      });
    }
  };
};
