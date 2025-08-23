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
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved user stats successfully.",
    data: null,
  });
});
const getTransactionStats = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved user stats successfully.",
    data: null,
  });
});
const getCommissionStats = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved user stats successfully.",
    data: null,
  });
});
const getAuditLogStats = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved user stats successfully.",
    data: null,
  });
});

export const statsController = {
  getUserStats,
  getAgentStats,
  getTransactionStats,
  getCommissionStats,
  getAuditLogStats,
};
