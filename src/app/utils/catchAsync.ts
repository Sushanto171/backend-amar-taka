import { NextFunction, Request, Response } from "express";
type CatchAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsync =
  (fn: CatchAsyncHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
