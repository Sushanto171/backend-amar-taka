/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSource } from "../interfaces/ErrorTypes";

export const globalErrorHandler = (
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    // console.log("GlobalErrorHandler:", error);
  }
  let status = 500;
  let message = error.message || "Something went wrong!";
  let errorSource: TErrorSource[] = [];

  if (error instanceof AppError) {
    status = error.statusCode;
  }
  
  if (error instanceof ZodError) {
    const formatted = handleZodError(error);
    message = formatted.message;
    errorSource = formatted.errorSource;
    status = formatted.status;
  }

  res.status(status).json({
    statusCode: status,
    success: false,
    message,
    errorSource,
    error: envVars.NODE_ENV === "development" ? error : null,
    stack: envVars.NODE_ENV === "development" ? error.stack : null,
  });
};
