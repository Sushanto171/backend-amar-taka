import { ClientSession, Document } from "mongoose";
import { ITransactionStatus } from "../modules/transaction/transaction.interface";

import { ITransaction } from "../modules/transaction/transaction.interface";

export const updateTransactionStatus = async (
  transaction: Document & ITransaction,
  fee: number,
  session: ClientSession
) => {
  transaction.status = ITransactionStatus.SUCCESS;
  transaction.fee = fee;

  await transaction.save({ session });
  return transaction;
};
