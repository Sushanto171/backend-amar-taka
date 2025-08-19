import { startSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { hashPassword } from "../../utils/bcryptjs";

import { Request } from "express";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import { IAuditActionType } from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { transactionService } from "./../transaction/transaction.service";
import { walletService } from "./../wallet/wallet.service";
import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (req: Request) => {
  const payload = req.body;
  const session = await startSession();
  session.startTransaction();
  try {
    const isUserExist = await User.findOne({ phone: payload.phone });
    if (isUserExist) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "User already exist.");
    }

    payload.password = await hashPassword(
      payload.password as string,
      envVars.BCRYPT_SALT_ROUND
    );

    const userArray = await User.create([payload], { session });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = userArray[0].toObject();

    const wallet = await walletService.createWallet(user._id, session);

    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.REGISTRATION_USER,
        actor: user._id,
        actorWallet: wallet._id,
        status: ITransactionStatus.SUCCESS,
        metadata: { message: "User registration success." },
      },
      req,
      session,
    });

    await User.findByIdAndUpdate(user._id, { wallet: wallet._id }, { session });

    const system = await updateSystemWallet({
      amount: envVars.USER.USER_WELCOME_BONUS,
      session,
    });

    const transactionPayload: ITransaction = {
      amount: envVars.USER.USER_WELCOME_BONUS, //paisa
      fromWallet: system?._id as Types.ObjectId,
      toWallet: wallet._id,
      phone: user.phone,
      fee: 0,
      status: ITransactionStatus.SUCCESS,
      type: ITransactionType.CASH_IN,
      reference: `welcome-bonus-${Date.now()}`,
    };

    await transactionService.createTransaction(req, transactionPayload);

    await session.commitTransaction();
    return user;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getAllUsers = async () => {
  const users = await User.find();
  return { users };
};

const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }
  return user;
};

const getMe = async (userId: string) => {
  const isUserExist = await User.findById(userId).populate("wallet");

  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
  }

  return isUserExist;
};

const updateUser = async (userId: string, payload: Partial<IUser>) => {
  const isUserExist = await User.findById(userId).select("-password");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }

  const user = await User.findByIdAndUpdate(userId, payload, {
    runValidators: true,
    new: true,
  });

  return user;
};

export const userService = {
  createUser,
  getAllUsers,
  getSingleUser,
  getMe,
  updateUser,
};
