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
  const transactions = await transactionService.createTransaction(
    req,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All Transaction Retrieved Successfully.",
    data: transactions,
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
  const transaction = await transactionService.deposit(req);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Deposit Success.",
    data: transaction,
  });
});

const withdraw = catchAsync(async (req, res) => {
  const transaction = await transactionService.withdraw(req);

  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Cash out Success.",
    data: transaction,
  });
});

export const transactionController = {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
  deposit,
  withdraw,
};
