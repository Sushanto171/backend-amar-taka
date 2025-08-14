/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { httpsStatusCodes } from "../utils/https-status-codes";
import { sendResponse } from "../utils/sendResponse";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  sendResponse(res, {
    statusCode: httpsStatusCodes.NOT_FOUND,
    success: false,
    message: `Sorry! ${req.path} does not found.`,
    data: null,
  });
};
