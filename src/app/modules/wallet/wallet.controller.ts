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
  const info = await walletService.getAllWallets(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All wallets retrieved successfully!",
    data: info.wallets,
    meta: info.meta,
  });
});

const deposit = catchAsync(async (req, res) => {
  const transaction = await walletService.deposit(req);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Deposit Success.",
    data: transaction,
  });
});

const withdraw = catchAsync(async (req, res) => {
  const transaction = await walletService.withdraw(req);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Cash out Success.",
    data: transaction,
  });
});

const P2P = catchAsync(async (req, res) => {
  const transaction = await walletService.P2P(req);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Cash out Success.",
    data: transaction,
  });
});

export const walletController = {
  myWallet,
  getAllWallets,
  deposit,
  withdraw,
  P2P,
};
