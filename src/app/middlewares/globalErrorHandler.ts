/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { handleCastError } from "../helpers/handleCastError";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { TErrorSource } from "../interfaces/ErrorTypes";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("GlobalErrorHandler:", error);
  }
  let status = 500;
  let message = error.message || "Something went wrong!";
  let errorSource: TErrorSource[] = [];

  //zod error
  if (error instanceof ZodError) {
    const formatted = handleZodError(error);
    message = formatted.message;
    errorSource = formatted?.errorSource as TErrorSource[];
    status = formatted.status;
  }
  //cast error
  else if (error.name === "CastError") {
    const formatted = handleCastError(error);
    message = formatted.message;
    status = formatted.status;
  }
  //validation error
  else if (error.name === "ValidationError") {
    const formatted = handleValidationError(error);
    message = formatted.message;
    status = formatted.status;
    errorSource = formatted.errorSource as TErrorSource[];
  }
  //duplicate error
  else if (error.code === 11000) {
    const formatted = handleDuplicateError(error);
    message = formatted.message;
    status = formatted.status;
  } else if (error instanceof AppError) {
    message = error.message;
    status = error.statusCode;
  } else if (error instanceof Error) {
    message = error.message;
    status = httpsStatusCodes.INTERNAL_SERVER_ERROR;
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
