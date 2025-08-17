import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { transactionService } from "./transaction.service";

const getAllTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getAllTransactions();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All Transaction Retrieved Successfully.",
    data: transactions,
  });
});
const getTransactionByUserId = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const transactions = await transactionService.getTransactionByUserId(userId);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All Transaction Retrieved Successfully.",
    data: transactions,
  });
});

const getSingleTransaction = catchAsync(async (req, res) => {
  const transId = req.params.transactionId;
  const userId = req.user.userId;
  const transactions = await transactionService.getSingleTransaction(
    userId,
    transId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Transaction Retrieved Successfully.",
    data: transactions,
  });
});

const deposit = catchAsync(async (req, res) => {
  const agentId = req.user.agentId;
  const walletId = req.user.userId;
  const transaction = await transactionService.deposit(
    req,
    agentId,
    walletId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Deposit Success.",
    data: transaction,
  });
});

export const transactionController = {
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
  deposit,
};
