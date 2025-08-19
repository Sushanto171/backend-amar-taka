import { Request } from "express";
import mongoose, { ClientSession, Types } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import {
  ITransactionStatus,
  ITransactionType,
} from "../modules/transaction/transaction.interface";
import { Transaction } from "../modules/transaction/transaction.model";
import { httpsStatusCodes } from "./https-status-codes";

export const validateTransactionBeforeProcess = async (
  req: Request,
  session: ClientSession,
  type: ITransactionType
) => {
  const { transactionId } = req.body;
  const walletId = req.user.wallet._id as Types.ObjectId;
  const transaction = await Transaction.findOne({
    _id: new mongoose.Types.ObjectId(transactionId),
    type,
  }).session(session);
  if (!transaction) {
    throw new AppError(
      httpsStatusCodes.NOT_FOUND,
      "Transaction does not found."
    );
  }

  if (!transaction.fromWallet.equals(walletId)) {
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
