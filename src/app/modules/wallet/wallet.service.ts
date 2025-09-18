/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { ClientSession, Document, startSession, Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { calculatePercent } from "../../utils/calculatePercent";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import {
  IncType,
  updateTransactionBalance,
} from "../../utils/updateTransactionBalance";
import { updateTransactionStatus } from "../../utils/updateTransactionStatus";
import { validateTransactionBeforeProcess } from "../../utils/validateTransactionBeforeProcess";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { eventBus } from "../event/eventBus";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { IWallet, IWalletType } from "./wallet.interface";
import { Wallet } from "./wallet.model";
import { WalletAction } from "./wallet.validator";

const createWallet = async (
  req: Request,
  user: Partial<IUser>,
  session: ClientSession
) => {
  try {
    const walletPayload: IWallet = {
      balance: 0,
      user: user._id as Types.ObjectId,
      type: IWalletType.PERSONAL,
    };

    const walletArray = await Wallet.create([walletPayload], { session });
    const wallet = walletArray[0].toObject();

    return wallet;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const myWallet = async (userId: string) => {
  const isUserExist = await User.findById(userId).populate("wallet");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist");
  }
  return isUserExist.wallet;
};

// admin route
const getAllWallets = async (query: Record<string, string>) => {
  const wallet = new QueryBuilder(Wallet.find(), query)
    .filter()
    .fields()
    .sort()
    .paginate();
  const [wallets, meta] = await Promise.all([wallet.build(), wallet.getMeta()]);
  return { wallets, meta };
};

const getSingleWallet = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "Wallet does not found");
  }
  return wallet;
};

const againstWalletAction = async (payload: WalletAction) => {
  const wallet = await Wallet.findById(payload.walletId);
  if (!wallet) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "Wallet does not found");
  }
  wallet.isBlock = payload.isBlock;
  await wallet.save({ validateBeforeSave: true });
  return null;
};

const deposit = async (req: Request) => {
  const session = await startSession();
  session.startTransaction();
  let transaction;
  const agentWallet = req.user.wallet as IWallet;
  const userId = req.user.userId;
  try {
    transaction = await validateTransactionBeforeProcess(
      req,
      session,
      ITransactionType.CASH_IN
    );

    if (transaction.amount > agentWallet.balance) {
      transaction.status = ITransactionStatus.FAILED;
      await transaction.save({ session });
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "DEPOSIT",
    });

    //update transaction status
    transaction = await updateTransactionStatus(
      transaction as Document & ITransaction,
      calculation.deductFee as number,
      session
    );

    // update to user wallet
    await updateTransactionBalance({
      walletId: transaction.toWallet as Types.ObjectId,
      balance: transaction.amount - (calculation.deductFee as number),
      session: session,
      incType: IncType.increment,
    });

    // update from agent wallet
    await updateTransactionBalance({
      walletId: transaction.fromWallet,
      balance: transaction.amount,
      session: session,
      incType: IncType.decrement,
      revenue: calculation.agentRevenue,
    });

    //create agent commission
    eventBus.emit("commission", {
      commission: calculation.agentRevenue as number,
      user: req.user.userId,
      transaction: transaction._id as Types.ObjectId,
    });

    // increment system revenue
    const systemWallet = await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    //create system commission
    if (systemWallet) {
      eventBus.emit("commission", {
        commission: calculation.systemRevenue as number,
        user: systemWallet.user,
        transaction: transaction._id as Types.ObjectId,
      });
    }

    await session.commitTransaction();

    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: transaction.toWallet,
        actor: userId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
    });
    eventBus.emit("sendSms", {
      timeStamp: new Date(),
      message: "Cash in Success",
      senderNumber: transaction.sender,
      receiverNumber: transaction.receiver,
      fee: transaction.fee,
      amount: transaction.amount - Number(calculation.deductFee),
      reference: transaction.reference,
      transactionId: (transaction._id as Types.ObjectId).toHexString(),
    });

    return transaction;
  } catch (error: any) {
    await session.abortTransaction();
    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.CASH_IN,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: userId,
        actorWallet: agentWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
          message: error.message,
        },
      },
    });
    eventBus.emit("sendSms", {
      message: error.message,
      senderNumber: transaction?.sender,
      receiverNumber: transaction?.receiver,
      timeStamp: new Date(),
    });
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
  const userId = req.user.userId;

  try {
    transaction = await validateTransactionBeforeProcess(
      req,
      session,
      ITransactionType.CASH_OUT
    );

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "WITHDRAW",
    });

    const costAmount = transaction.amount + (calculation.deductFee as number);
    if (userWallet.balance < costAmount) {
      transaction.status = ITransactionStatus.FAILED;
      await transaction.save({ session });
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    //update transaction status
    transaction = await updateTransactionStatus(
      transaction,
      calculation.deductFee as number,
      session
    );

    // update user wallet
    await updateTransactionBalance({
      walletId: transaction.fromWallet,
      balance: transaction.amount + (calculation.deductFee as number),
      session: session,
      incType: IncType.decrement,
    });

    // update agent wallet
    await updateTransactionBalance({
      walletId: transaction.toWallet as Types.ObjectId,
      balance: transaction.amount,
      incType: IncType.increment,
      revenue: calculation.agentRevenue,
      session: session,
    });

    // create agent commission
    eventBus.emit("commission", {
      commission: calculation.agentRevenue as number,
      user: transaction.toWallet as Types.ObjectId,
      transaction: transaction._id as Types.ObjectId,
    });

    // increment system revenue
    const systemWallet = await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    //create system commission
    if (systemWallet) {
      eventBus.emit("commission", {
        commission: calculation.systemRevenue as number,
        user: systemWallet.user,
        transaction: transaction._id as Types.ObjectId,
      });
    }

    await session.commitTransaction();

    // create withdraw log
    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.CASH_OUT,
        targetWallet: transaction.toWallet,
        actor: userId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
    });

    eventBus.emit("sendSms", {
      timeStamp: new Date(),
      message: "Cash out Success",
      senderNumber: transaction.sender,
      receiverNumber: transaction.receiver,
      fee: transaction.fee,
      amount: transaction.amount + Number(calculation.deductFee),
      reference: transaction.reference,
      transactionId: (transaction._id as Types.ObjectId).toHexString(),
    });

    return transaction;
  } catch (error: any) {
    await session.abortTransaction();

    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.CASH_OUT,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: userId,
        actorWallet: userWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
          message: error.message,
        },
      },
    });

    eventBus.emit("sendSms", {
      message: error.message,
      senderNumber: transaction?.sender,
      receiverNumber: transaction?.receiver,
      timeStamp: new Date(),
    });
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
  const userId = req.user.userId;
  try {
    transaction = await validateTransactionBeforeProcess(
      req,
      session,
      ITransactionType.P2P_TRANSFER
    );

    const calculation = calculatePercent({
      amount: transaction.amount,
      type: "P2P",
    });

    const costAmount = transaction.amount + (calculation.deductFee as number);
    if (fromWallet.balance < costAmount) {
      transaction.status = ITransactionStatus.FAILED;
      await transaction.save({ session });
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
    }

    //update transaction status
    transaction = await updateTransactionStatus(
      transaction,
      calculation.deductFee as number,
      session
    );

    // update from user wallet
    await updateTransactionBalance({
      walletId: transaction.fromWallet,
      balance: transaction.amount + (calculation.deductFee as number),
      incType: IncType.decrement,
      session: session,
    });

    // update to user wallet
    await updateTransactionBalance({
      walletId: transaction.toWallet as Types.ObjectId,
      balance: transaction.amount,
      incType: IncType.increment,
      session: session,
    });

    // increment system wallet revenue
    const systemWallet = await updateSystemWallet({
      revenue: calculation.systemRevenue,
      session,
    });

    //create system commission
    if (systemWallet) {
      eventBus.emit("commission", {
        commission: calculation.systemRevenue as number,
        user: systemWallet.user,
        transaction: transaction._id as Types.ObjectId,
      });
    }

    await session.commitTransaction();
    // create action log
    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.P2P_TRANSFER,
        targetWallet: transaction.toWallet,
        actor: userId as Types.ObjectId,
        actorWallet: transaction.fromWallet,
        status: IAuditStatus.SUCCESS,
        metadata: {
          amount: transaction.amount,
          transactionId: transaction._id,
        },
      },
    });

    eventBus.emit("sendSms", {
      timeStamp: new Date(),
      message: "Send money Success",
      senderNumber: transaction.sender,
      receiverNumber: transaction.receiver,
      fee: transaction.fee,
      amount: transaction.amount + Number(calculation.deductFee),
      reference: transaction.reference,
      transactionId: (transaction._id as Types.ObjectId).toHexString(),
    });
    return transaction;
  } catch (error: any) {
    await session.abortTransaction();

    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.P2P_TRANSFER,
        targetWallet: transaction
          ? (transaction.toWallet as Types.ObjectId)
          : undefined,
        actor: userId,
        actorWallet: fromWallet._id,
        status: IAuditStatus.FAILED,
        metadata: {
          amount: transaction ? transaction.amount : undefined,
          message: error.message,
        },
      },
    });
    eventBus.emit("sendSms", {
      message: error.message,
      senderNumber: transaction?.sender,
      receiverNumber: transaction?.receiver,
      timeStamp: new Date(),
    });
    throw error;
  } finally {
    await session.endSession();
  }
};

export const walletService = {
  createWallet,
  myWallet,
  getAllWallets,
  getSingleWallet,
  againstWalletAction,
  deposit,
  withdraw,
  P2P,
};
