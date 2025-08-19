import { Request } from "express";
import { ClientSession } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import { ITransactionStatus } from "../modules/transaction/transaction.interface";
import { Transaction } from "../modules/transaction/transaction.model";
import { httpsStatusCodes } from "./https-status-codes";

export const validateTransactionBeforeProcess = async (
  req: Request,
  session: ClientSession
) => {
  const { transactionId } = req.body;
  const userId = req.user.userId;
  const transaction = await Transaction.findById(transactionId).session(
    session
  );
  if (!transaction) {
    throw new AppError(
      httpsStatusCodes.NOT_FOUND,
      "Transaction does not found."
    );
  }

  if (transaction.fromWallet !== userId) {
    throw new AppError(httpsStatusCodes.UNAUTHORIZED, "Unauthorized access!");
  }
  if (transaction.status === ITransactionStatus.SUCCESS) {
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      "This transaction has already been processed."
    );
  }
  return transaction;
};
