/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorSource, TGenericErrorTypes } from "../interfaces/ErrorTypes";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const handleValidationError = (err: any): TGenericErrorTypes => {
  const error = Object.values(err.errors);
  const errorSource: TErrorSource[] = error.map((field: any) => {
    return { path: field.path, message: field.message };
  });
  return {
    message: "Validation Error",
    status: httpsStatusCodes.BAD_REQUEST,
    errorSource,
  };
};
