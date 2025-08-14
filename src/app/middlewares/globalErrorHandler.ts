/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { sendResponse } from "../utils/sendResponse";

export const globalErrorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  let status = 5000;
  const message = error.message || "Something went wrong!";

  if (error instanceof AppError) {
    status = error.statusCode;
  }

  sendResponse(res, {
    statusCode: status,
    success: false,
    message,
    data: null,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};
