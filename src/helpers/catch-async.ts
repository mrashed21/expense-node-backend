import { NextFunction, Request, Response } from "express";

/**
 * Wraps an async route handler and forwards any thrown error to Express's
 * next(error) so the global error-handler middleware can process it.
 */
const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
