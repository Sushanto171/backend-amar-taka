import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { walletService } from "./wallet.service";

const myWallet = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const wallet = await walletService.myWallet(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Your wallet retrieved successfully!",
    data: wallet,
  });
});

const getAllWallets = catchAsync(async (req, res) => {

  const wallets = await walletService.getAllWallets();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All wallets retrieved successfully!",
    data: wallets,
  });
});

export const walletController = {
  myWallet,
  getAllWallets,
};
