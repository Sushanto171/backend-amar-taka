import { ZodError } from "zod";
import { TGenericErrorTypes } from "../interfaces/ErrorTypes";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const handleZodError = (error: ZodError): TGenericErrorTypes => {
  const formatted = error.issues.map((error) => ({
    path: error.path.join("."),
    message: error.message,
  }));
  return {
    errorSource: formatted,
    message: error.name,
    status: httpsStatusCodes.BAD_REQUEST,
  };
};
