import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpsStatusCodes.CREATED,
    success: true,
    message: "User registered successfully!",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  sendResponse(res, {
    statusCode: httpsStatusCodes.CREATED,
    success: true,
    message: "User retrieved successfully!",
    data: users,
  });
});

export const userController = {
  createUser,
  getAllUsers,
};
