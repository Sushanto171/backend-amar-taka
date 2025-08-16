import { startSession } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { hashPassword } from "../../utils/bcryptjs";
import { createTransaction } from "../../utils/createTransaction";
import { createWallet } from "../../utils/createWallet";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { IRole, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const session = await startSession();
  session.startTransaction();

  const isUserExist = await User.findOne({ phone: payload.phone });
  if (isUserExist) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "User already exist.");
  }

  payload.password = hashPassword(
    payload.password as string,
    envVars.BCRYPT_SALT_ROUND
  );

  const userArray = await User.create([payload], { session });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = userArray[0].toObject();

  const wallet = await createWallet(user._id, session);

  await User.findByIdAndUpdate(user._id, { wallet: wallet._id }, { session });

  const system = await updateSystemWallet(
    envVars.USER.USER_WELCOME_BONUS,
    session
  );

  if (!system) {
    throw new AppError(
      httpsStatusCodes.NOT_FOUND,
      "System wallet does not found"
    );
  }

  const transactionPayload: ITransaction = {
    amount: envVars.USER.USER_WELCOME_BONUS, //paisa
    wallet: system._id,
    destinationWallet: wallet._id,
    fee: 0,
    status: ITransactionStatus.SUCCESS,
    type: ITransactionType.CASH_IN,
    initiateRole: IRole.ADMIN,
    reference: `welcome-bonus-${Date.now()}`,
  };

  await createTransaction(transactionPayload, session);

  await session.commitTransaction();
  await session.endSession();

  return {
    user: {
      name: user.name,
      role: user.role,
      _id: user._id,
      phone: user.phone,
    },
  };
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
