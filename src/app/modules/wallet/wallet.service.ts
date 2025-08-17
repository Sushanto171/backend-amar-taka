import { ClientSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { User } from "../user/user.model";
import { IWallet, IWalletType } from "./wallet.interface";
import { Wallet } from "./wallet.model";

const createWallet = async (userId: Types.ObjectId, session: ClientSession) => {
  try {
    const walletPayload: IWallet = {
      balance: envVars.USER.USER_WELCOME_BONUS,
      user: userId,
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
const getAllWallets = async () => {
  const wallets = await Wallet.find();
  return wallets;
};

export const walletService = {
  createWallet,
  myWallet,
  getAllWallets,
};
