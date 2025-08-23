/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorTypes } from "../interfaces/ErrorTypes";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const handleDuplicateError = (error: any): TGenericErrorTypes => {
  const matchedArray = error.errmsg.match(/"([^"]*)"/);
  return {
    message: `${matchedArray[0]} is Already exist.`,
    status: httpsStatusCodes.CONFLICT,
  };
};
