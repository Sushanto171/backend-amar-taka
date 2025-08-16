import { ClientSession } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import { ITransaction } from "../modules/transaction/transaction.interface";
import { Transaction } from "../modules/transaction/transaction.model";
import { httpsStatusCodes } from "./https-status-codes";

export const createTransaction = async (
  payload: ITransaction,
  session: ClientSession
) => {
  try {
    const transactionArray = await Transaction.create([payload], {
      session,
    });
    const transaction = transactionArray[0].toObject();
    return transaction;
  } catch (error) {
    console.log("Transaction creation error:", error);
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpsStatusCodes.INTERNAL_SERVER_ERROR,
      "Transaction creation error."
    );
  }
};
