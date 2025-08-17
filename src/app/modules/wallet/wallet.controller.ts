import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { walletService } from "./wallet.service";

const myWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.myWallet();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Your wallet retrieved successfully!",
    data: wallet,
  });
});

export const walletController = {
  myWallet,
};
