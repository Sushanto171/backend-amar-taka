import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { statsService } from "./stats.service";

const getUserStats = catchAsync(async (req, res) => {
  const info = await statsService.getUserStats();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved user stats successfully.",
    data: info,
  });
});
const getAgentStats = catchAsync(async (req, res) => {
  const info = await statsService.getAgentStats();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved Agents stats successfully.",
    data: info,
  });
});
const getTransactionStats = catchAsync(async (req, res) => {
  const info = await statsService.getTransactionStats();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved Transaction stats successfully.",
    data: info,
  });
});
const getSystemStats = catchAsync(async (req, res) => {
  const info = await statsService.getSystemStats(req.user.wallet);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved system stats successfully.",
    data: info,
  });
});

export const statsController = {
  getUserStats,
  getAgentStats,
  getTransactionStats,
  getSystemStats,
};
