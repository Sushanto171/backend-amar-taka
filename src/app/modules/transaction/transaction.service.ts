import mongoose, { startSession, Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { User } from "../user/user.model";
import { Transaction } from "./transaction.model";

import { Request } from "express";
import { ClientSession } from "mongoose";
import calculateDepositPercent from "../../utils/calculatePercent";
import { checkAccountAndWalletHealth } from "../../utils/checkAccountAndWalletHealth";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "./transaction.interface";

const createTransaction = async (
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

const getAllTransactions = async () => {
  const trans = await Transaction.find();
  return trans;
};

const getTransactionByUserId = async (userId: string) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist");
  }
  const transactions = await Transaction.find({
    $or: [
      {
        wallet: isUserExist.wallet,
      },
      {
        destinationWallet: isUserExist.wallet,
      },
    ],
  });
  return transactions;
};

const getSingleTransaction = async (userId: string, transId: string) => {
  const isUserExist = await User.findById(userId);
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist");
  }
  const transaction = await Transaction.findOne({
    $and: [
      {
        _id: new mongoose.Types.ObjectId(transId),
        $or: [
          {
            wallet: isUserExist.wallet,
          },
          {
            destinationWallet: isUserExist.wallet,
          },
        ],
      },
    ],
  });
  return transaction;
};

const deposit = async (
  req: Request,
  agentId: Types.ObjectId,
  fromWalletId: Types.ObjectId,
  payload: ITransaction
) => {
  const session = await startSession();
  session.startTransaction();

  const calculation = calculateDepositPercent(payload.amount);
  const depositPayload: ITransaction = {
    fromWallet: fromWalletId,
    toWallet: payload.toWallet,
    amount: payload.amount,
    reference: payload.reference,
    status: ITransactionStatus.SUCCESS,
    type: ITransactionType.CASH_IN,
    fee: calculation.deductFee,
  };
  try {
    await checkAccountAndWalletHealth(payload.toWallet, session);

    const transactionArray = await Transaction.create([depositPayload], {
      session,
    });
    const transaction = transactionArray[0].toObject();
    await Wallet.findByIdAndUpdate(
      payload.toWallet,
      {
        $inc: { balance: payload.amount - calculation.deductFee },
      },
      { runValidators: true, session }
    );

    await Wallet.findByIdAndUpdate(
      fromWalletId,
      {
        $inc: { balance: -payload.amount, revenue: +calculation.agentRevenue },
      },
      { session, runValidators: true, new: true }
    );

    await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: payload.toWallet,
        actor: agentId,
        actorWallet: fromWalletId,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: depositPayload.amount,
          transactionId: transaction._id,
        },
      },
      session,
      req,
    });

    await session.commitTransaction();
  } catch (error) {
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: payload.toWallet,
        actor: agentId,
        actorWallet: fromWalletId,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: depositPayload.amount,
        },
      },
      session,
      req,
    });
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
  return {};
};

export const transactionService = {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
  deposit,
};
