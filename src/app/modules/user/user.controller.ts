import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req);
  sendResponse(res, {
    statusCode: httpsStatusCodes.CREATED,
    success: true,
    message: "User registered successfully!",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const info = await userService.getAllUsers(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: httpsStatusCodes.OK,
    success: true,
    message: "User retrieved successfully!",
    data: info.users,
    meta: info.metaData,
  });
});

const againstUserAction = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  await userService.againstUserAction(payload);
  sendResponse(res, {
    statusCode: httpsStatusCodes.OK,
    success: true,
    message: "Take action successfully!",
    data: {},
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await userService.getSingleUser(userId);
  sendResponse(res, {
    statusCode: httpsStatusCodes.OK,
    success: true,
    message: "User retrieved successfully!",
    data: user,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const userInfo = await userService.getMe(userId);
  sendResponse(res, {
    statusCode: httpsStatusCodes.OK,
    success: true,
    message: "Your Profile retrieved successfully!",
    data: userInfo,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await userService.updateUser(userId, req.body);
  sendResponse(res, {
    statusCode: httpsStatusCodes.OK,
    success: true,
    message: "User profile updated successfully!",
    data: user,
  });
});
export const userController = {
  createUser,

  getAllUsers,
  againstUserAction,
  getSingleUser,
  getMe,
  updateUser,
};
