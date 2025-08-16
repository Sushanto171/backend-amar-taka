import { startSession } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { hashPassword } from "../../utils/bcryptjs";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { IWallet, IWalletType } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import { IRole, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const session = await startSession();
  session.startTransaction();

  const isUserExist = await User.findOne({ phone: payload.phone });
  if (isUserExist) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "User already exist.");
  }
  // 1. hash password
  payload.password = hashPassword(
    payload.password as string,
    envVars.BCRYPT_SALT_ROUND
  );

  // step: 2 create user
  const result = await User.create([payload], { session });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = result[0].toObject();

  // 3. create wallet for this user
  const walletPayload: IWallet = {
    balance: envVars.USER.USER_WELCOME_BONUS,
    user: user._id,
    type: IWalletType.PERSONAL,
    limit: {
      daily: envVars.USER.USER_DAILY_CASHOUT_LIMIT,
      monthly: envVars.USER.USER_MONTHLY_CASHOUT_LIMIT,
    },
  };

  const wallet = await Wallet.create([walletPayload], { session });

  await User.findByIdAndUpdate(
    user._id,
    { wallet: wallet[0]._id },
    { session }
  );
  
  await Wallet.findOneAndUpdate(
    { type: IRole.ADMIN },
    { $inc: { balance: -envVars.USER.USER_WELCOME_BONUS } },
    { session }
  );

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
