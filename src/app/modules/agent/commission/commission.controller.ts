import { catchAsync } from "../../../utils/catchAsync";
import { httpsStatusCodes } from "../../../utils/https-status-codes";
import { sendResponse } from "../../../utils/sendResponse";
import { commissionService } from "./commission.service";

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

export const commissionController = {
  getCommissions,
};
