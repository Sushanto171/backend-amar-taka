import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { commissionService } from "./commIssion.service";

const getAllCommissions = catchAsync(async (req, res) => {
  const info = await commissionService.getAllCommissions(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved all commissions successfully.",
    data: info.commissions,
    meta: info.meta,
  });
});

const getCommissions = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const commissions = await commissionService.getCommissions(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved all commissions successfully.",
    data: commissions,
  });
});

const getSingleCommission = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const commissionId = req.params.commissionId;
  const commission = await commissionService.getSingleCommission(
    userId,
    commissionId
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved a commission successfully.",
    data: commission,
  });
});

export const commissionController = {
  getAllCommissions,
  getCommissions,
  getSingleCommission,
};
