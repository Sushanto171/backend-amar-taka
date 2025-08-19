/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { startSession, Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { User } from "../user/user.model";
import { Transaction } from "./transaction.model";
import { Request } from "express";
import { ClientSession } from "mongoose";
import { calculatePercent } from "../../utils/calculatePercent";
import { checkToUserWithWallet } from "../../utils/checkToUserWithWallet";
import {
  checkSameNumber,
  checkTransactionTypeWithRole,
} from "../../utils/checkTransactionTypeWithRole";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import { validateTransactionBeforeProcess } from "../../utils/validateTransactionBeforeProcess";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import { IWallet } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import { ITransaction, ITransactionStatus } from "./transaction.interface";

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

const deposit = async (req: Request) => {
  const session = await startSession();
  session.startTransaction();
  let transaction;
  const agentWallet = req.user.wallet as IWallet;
  try {
    transaction = await validateTransactionBeforeProcess(req, session);

    if (transaction.amount > agentWallet.balance) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "DEPOSIT",
    });

    transaction.status = ITransactionStatus.SUCCESS;
    transaction.fee = calculation.deductFee as number;
    await transaction.save({ session }); //update transaction status

    // update to user wallet
    await Wallet.findByIdAndUpdate(
      transaction.toWallet,
      {
        $inc: {
          balance: transaction.amount - (calculation.deductFee as number),
        },
      },
      { runValidators: true, session, new: true }
    );

    // update from user wallet
    await Wallet.findByIdAndUpdate(
      transaction.fromWallet,
      {
        $inc: {
          balance: -transaction.amount,
          revenue: +(calculation.agentRevenue as number),
        },
      },
      { session, runValidators: true, new: true }
    );

    // increment system revenue
    await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    // create deposit log
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: transaction.toWallet,
        actor: agentWallet._id as Types.ObjectId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
      session,
      req,
    });
    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: agentWallet.user._id,
        actorWallet: agentWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
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
};

const withdraw = async (req: Request) => {
  const session = await startSession();
  session.startTransaction();
  let transaction;
  const userWallet = req.user.wallet as IWallet;

  try {
    transaction = await validateTransactionBeforeProcess(req, session);

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "WITHDRAW",
    });

    const costAmount = transaction.amount + (calculation.deductFee as number);
    if (userWallet.balance < costAmount) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    transaction.status = ITransactionStatus.SUCCESS;
    transaction.fee = calculation.deductFee as number;
    await transaction.save({ session }); //update transaction status

    // update user wallet
    await Wallet.findByIdAndUpdate(
      transaction.fromWallet,
      {
        $inc: {
          balance: -(transaction.amount + (calculation.deductFee as number)),
        },
      },
      { runValidators: true, session, new: true }
    );

    // update agent wallet
    await Wallet.findByIdAndUpdate(
      transaction.toWallet,
      {
        $inc: {
          balance: +transaction.amount,
          revenue: +(calculation.agentRevenue as number),
        },
      },
      { session, runValidators: true, new: true }
    );

    // increment system revenue
    await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    // create withdraw log
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_OUT,
        targetWallet: transaction.toWallet,
        actor: userWallet._id as Types.ObjectId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
      session,
      req,
    });
    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_OUT,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: userWallet.user._id,
        actorWallet: userWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
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
};

const P2P = async (req: Request) => {
  const session = await startSession();
  session.startTransaction();
  let transaction;
  const fromWallet = req.user.wallet as IWallet;
  try {
    transaction = await validateTransactionBeforeProcess(req, session);

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "P2P",
    });

    const costAmount = transaction.amount + (calculation.deductFee as number);
    if (fromWallet.balance < costAmount) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    transaction.status = ITransactionStatus.SUCCESS;
    transaction.fee = calculation.deductFee as number;

    await transaction.save({ session }); //update transaction status

    // update from user wallet
    await Wallet.findByIdAndUpdate(
      transaction.fromWallet,
      {
        $inc: {
          balance: -(transaction.amount + (calculation.deductFee as number)),
        },
      },
      { runValidators: true, session, new: true }
    );

    // update to user wallet
    await Wallet.findByIdAndUpdate(
      transaction.toWallet,
      {
        $inc: {
          balance: +transaction.amount,
        },
      },
      { session, runValidators: true, new: true }
    );

    // increment system wallet revenue
    await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    // create action log
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.P2P_TRANSFER,
        targetWallet: transaction.toWallet,
        actor: fromWallet._id as Types.ObjectId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
      session,
      req,
    });
    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.P2P_TRANSFER,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: fromWallet.user._id,
        actorWallet: fromWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
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
};

export const transactionService = {
  createTransaction,
  getAllTransactions,
  getTransactionByUserId,
  getSingleTransaction,
  deposit,
  withdraw,
  P2P,
};
