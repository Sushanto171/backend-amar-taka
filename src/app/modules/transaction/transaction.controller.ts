import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { ITransaction } from "./transaction.interface";
import { transactionService } from "./transaction.service";

const createTransaction = catchAsync(async (req, res) => {
  req.body = {
    ...req.body,
    fromWallet: req.user.wallet,
    userId: req.user.userId,
  } as ITransaction;
  const transaction = await transactionService.createTransaction(req, req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Transaction created Successfully.",
    data: transaction,
  });
});

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
  const transactions = await transactionService.getSingleTransaction(transId);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Transaction Retrieved Successfully.",
    data: transactions,
  });
});

export const transactionController = {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
};
