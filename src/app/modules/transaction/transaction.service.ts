/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { ClientSession, startSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { checkToUserWithWallet } from "../../utils/checkToUserWithWallet";
import {
  checkSameNumber,
  checkTransactionTypeWithRole,
} from "../../utils/checkTransactionTypeWithRole";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IAuditActionType } from "../auditLogs/auditLogs.interface";
import { eventBus } from "../event/eventBus";
import { systemConfig } from "../settings/settings.service";
import { User } from "../user/user.model";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";

const createTransaction = async (
  req: Request,
  payload: ITransaction,
  c_session?: ClientSession
) => {
  let session: ClientSession;
  let toUserInfo;
  let transaction;
  if (c_session) {
    session = c_session;
  } else {
    session = await startSession();
    session.startTransaction();
  }
  try {
    //call from api
    if (!payload.toWallet) {
      checkSameNumber(req); //fromUser.phone !== toUser.phone
      checkTransactionTypeWithRole(req.user.role, payload);
      toUserInfo = await checkToUserWithWallet(payload, session);
    }

    if (payload.type === ITransactionType.P2P_TRANSFER) {
      if (
        payload.amount <
        (systemConfig?.sendMoney?.min || envVars.P2P.P2P_MINIUM_AMOUNT)
      ) {
        throw new AppError(
          httpsStatusCodes.NOT_ACCEPTABLE,
          `Provide Minimum ${
            systemConfig?.sendMoney?.min || envVars.P2P.P2P_MINIUM_AMOUNT
          } amount for send money.`
        );
      }
    }
    const transPayload: ITransaction = {
      fromWallet: payload.fromWallet,
      sender: payload.sender,
      receiver: payload.receiver,
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

    eventBus.emit("log", {
      req,
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
    });

    if (!c_session) {
      await session.commitTransaction();
      await session.endSession();
    }
    return transaction;
  } catch (error: any) {
    eventBus.emit("log", {
      req,
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
    });
    if (session.isPinned && !c_session) {
      await session.abortTransaction().catch();
      await session.endSession().catch();
    }
    throw error;
  }
};

const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);
  const transaction = queryBuilder
    .filter()
    .search(["sender", "receiver", "reference", "amount", "type", "status"])
    .fields()
    .sort()
    .paginate();
  const [trans, meta] = await Promise.all([
    transaction.build(),
    transaction.getMeta(true),
  ]);
  return { trans, meta };
};

const getTransactionByUserId = async (
  userId: string,
  query: Record<string, string>
) => {
  const user = await User.findById(userId).select("wallet");
  if (!user) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  const queryBuilder = new QueryBuilder(
    Transaction.find({
      $or: [{ toWallet: user.wallet }, { fromWallet: user.wallet }],
    }),
    query
  );
  const transaction = queryBuilder
    .filter()
    .search(["sender", "receiver", "reference", "type", "status", "amount"])
    .fields()
    .sort()
    .paginate();

  const [trans, meta] = await Promise.all([
    transaction.build(),
    transaction.getMeta(true),
  ]);
  return { trans, meta };
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
