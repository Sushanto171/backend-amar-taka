/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { ClientSession, startSession, Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { checkToUserWithWallet } from "../../utils/checkToUserWithWallet";
import {
  checkSameNumber,
  checkTransactionTypeWithRole,
} from "../../utils/checkTransactionTypeWithRole";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { IAuditActionType } from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import { User } from "../user/user.model";
import { ITransaction, ITransactionStatus } from "./transaction.interface";
import { Transaction } from "./transaction.model";

const createTransaction = async (
  req: Request,
  payload: ITransaction,
  c_session?: ClientSession
) => {
  let session: ClientSession;
  if (c_session) {
    session = c_session;
  } else {
    session = await startSession();
    session.startTransaction();
  }
  let toUserInfo;
  let transaction;
  try {
    if (!payload.toWallet) {
      checkSameNumber(req); //fromUser.phone !== toUser.phone
      checkTransactionTypeWithRole(req.user.role, payload);
      toUserInfo = await checkToUserWithWallet(payload, session);
    }

    const transPayload: ITransaction = {
      fromWallet: payload.fromWallet,
      phone: payload.phone,
      toWallet: payload?.toWallet || (toUserInfo && toUserInfo.wallet),
      amount: payload.amount,
      reference: payload.reference,
      status: payload?.status || ITransactionStatus.PENDING,
      type: payload.type,
      fee: payload?.fee || 0,
    };
    const transactionArray = await Transaction.create([transPayload], {
      session,
    });
    transaction = transactionArray[0].toObject();

    await auditLogsService.createAuditLog({
      payload: {
        action:
          (payload?.type as unknown as IAuditActionType) ||
          IAuditActionType.CASH_IN,
        targetWallet:
          payload?.toWallet ||
          (toUserInfo && (toUserInfo.user.wallet as Types.ObjectId)),
        actor: payload.userId as Types.ObjectId,
        actorWallet: payload.fromWallet,
        status: payload?.status || ITransactionStatus.PENDING,
        metadata: {
          amount: payload.amount,
          transactionId: transaction._id,
        },
      },
      session,
      req,
    });

    if (!c_session) {
      await session.commitTransaction();
      await session.endSession();
    }
    return transaction;
  } catch (error: any) {
    await auditLogsService.createAuditLog({
      payload: {
        action: payload.type as unknown as IAuditActionType,
        targetWallet:
          payload?.toWallet ||
          (toUserInfo && (toUserInfo.user.wallet as Types.ObjectId)),
        actor: payload.userId as Types.ObjectId,
        actorWallet: payload.fromWallet,
        status: ITransactionStatus.FAILED,
        metadata: {
          amount: payload.amount,
          transactionId: transaction?._id,
          message: error.message,
        },
      },
      req,
    });
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpsStatusCodes.INTERNAL_SERVER_ERROR, error.message);
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
        toWallet: isUserExist.wallet,
      },
      {
        fromWallet: isUserExist.wallet,
      },
    ],
  });
  return transactions;
};

const getSingleTransaction = async (transId: string) => {
  const transaction = await Transaction.findById(transId);
  return transaction;
};

export const transactionService = {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
};
