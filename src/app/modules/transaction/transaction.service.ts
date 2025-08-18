/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { startSession, Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { User } from "../user/user.model";
import { Transaction } from "./transaction.model";

import { Request } from "express";
import { ClientSession } from "mongoose";

import { calculatePercent } from "../../utils/calculatePercent";
import { checkAccountAndWalletHealth } from "../../utils/checkAccountAndWalletHealth";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import { IRole } from "../user/user.interface";
import { IWallet } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "./transaction.interface";

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
  const userRole = req.user.role as IRole;
  if (
    (userRole === IRole.USER && payload.type === ITransactionType.CASH_IN) ||
    (userRole === IRole.AGENT && payload.type === ITransactionType.CASH_OUT)
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Your are to permitted for this action!"
    );
  }
  try {
    let healthResponse;
    if (!payload.toWallet) {
      healthResponse = await checkAccountAndWalletHealth(
        payload.phone,
        session,
        payload.type === ITransactionType.CASH_IN
          ? IRole.USER
          : payload.type === ITransactionType.CASH_OUT
          ? IRole.AGENT
          : IRole.USER
      );
    }

    if (payload.phone === req.user.phone) {
      throw new AppError(
        httpsStatusCodes.NOT_ACCEPTABLE,
        "Your can't transaction with some number!"
      );
    }
    const transPayload: ITransaction = {
      fromWallet: payload.fromWallet,
      phone: payload.phone,
      toWallet:
        payload.toWallet ||
        (healthResponse && (healthResponse.user.wallet as Types.ObjectId)),
      amount: payload.amount,
      reference: payload.reference,
      status: payload.status || ITransactionStatus.PENDING,
      type: payload.type,
      fee: payload.fee || 0,
    };
    const transactionArray = await Transaction.create([transPayload], {
      session,
    });

    const transaction = transactionArray[0].toObject();

    await auditLogsService.createAuditLog({
      payload: {
        action:
          (payload.type as unknown as IAuditActionType) ||
          IAuditActionType.CASH_IN,
        targetWallet:
          payload.toWallet ||
          (healthResponse && (healthResponse.user.wallet as Types.ObjectId)),
        actor: payload.userId as Types.ObjectId,
        actorWallet: payload.fromWallet,
        status: payload.status || ITransactionStatus.PENDING,
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
    console.log("Transaction creation error:", error);
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
  let isExistTransaction;
  const { transactionId } = req.body;
  const agentWallet = req.user.wallet as IWallet;
  try {
    isExistTransaction = await Transaction.findById(transactionId).session(
      session
    );
    if (!isExistTransaction) {
      throw new AppError(
        httpsStatusCodes.NOT_FOUND,
        "Transaction does not found."
      );
    }
    if (isExistTransaction.status === ITransactionStatus.SUCCESS) {
      throw new AppError(
        httpsStatusCodes.BAD_REQUEST,
        "This transaction has already been processed."
      );
    }
    if (isExistTransaction.amount > agentWallet.balance) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    const calculation = calculatePercent({
      amount: isExistTransaction.amount,
      type: "DEPOSIT",
    });

    const transaction = await Transaction.findByIdAndUpdate(
      isExistTransaction._id,
      {
        status: ITransactionStatus.SUCCESS,
        fee: calculation.deductFee,
      },
      {
        session,
        new: true,
        runValidators: true,
      }
    );

    await Wallet.findByIdAndUpdate(
      isExistTransaction.toWallet,
      {
        $inc: {
          balance:
            isExistTransaction.amount - (calculation.deductFee as number),
        },
      },
      { runValidators: true, session, new: true }
    );

    await Wallet.findByIdAndUpdate(
      isExistTransaction.fromWallet,
      {
        $inc: {
          balance: -isExistTransaction.amount,
          revenue: +(calculation.agentRevenue as number),
        },
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
        targetWallet: isExistTransaction.toWallet,
        actor: agentWallet._id as Types.ObjectId,
        actorWallet: isExistTransaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: isExistTransaction.amount,
          transactionId: isExistTransaction._id,
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
        targetWallet: isExistTransaction
          ? (isExistTransaction.toWallet as Types.ObjectId)
          : undefined,
        actor: agentWallet.user._id,
        actorWallet: agentWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: isExistTransaction ? isExistTransaction.amount : undefined,
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
  let isExistTransaction;
  const { transactionId } = req.body;
  const userWallet = req.user.wallet as IWallet;

  try {
    isExistTransaction = await Transaction.findById(transactionId).session(
      session
    );
    if (!isExistTransaction) {
      throw new AppError(
        httpsStatusCodes.NOT_FOUND,
        "Transaction does not found."
      );
    }

    const calculation = calculatePercent({
      amount: isExistTransaction.amount,
      type: "WITHDRAW",
    });
    const costAmount =
      isExistTransaction.amount + (calculation.deductFee as number);
    if (userWallet.balance < costAmount) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    const transaction = await Transaction.findByIdAndUpdate(
      isExistTransaction._id,
      {
        status: ITransactionStatus.SUCCESS,
        fee: calculation.deductFee,
      },
      {
        session,
        new: true,
        runValidators: true,
      }
    );

    await Wallet.findByIdAndUpdate(
      isExistTransaction.fromWallet,
      {
        $inc: {
          balance: -(
            isExistTransaction.amount + (calculation.deductFee as number)
          ),
        },
      },
      { runValidators: true, session, new: true }
    );

    await Wallet.findByIdAndUpdate(
      isExistTransaction.toWallet,
      {
        $inc: {
          balance: +isExistTransaction.amount,
          revenue: +(calculation.agentRevenue as number),
        },
      },
      { session, runValidators: true, new: true }
    );

    await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.CASH_OUT,
        targetWallet: isExistTransaction.toWallet,
        actor: userWallet._id as Types.ObjectId,
        actorWallet: isExistTransaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: isExistTransaction.amount,
          transactionId: isExistTransaction._id,
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
        targetWallet: isExistTransaction
          ? (isExistTransaction.toWallet as Types.ObjectId)
          : undefined,
        actor: userWallet.user._id,
        actorWallet: userWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: isExistTransaction ? isExistTransaction.amount : undefined,
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
};
