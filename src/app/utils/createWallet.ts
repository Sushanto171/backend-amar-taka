import { ClientSession, Types } from "mongoose";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { IWallet, IWalletType } from "../modules/wallet/wallet.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { httpsStatusCodes } from "./https-status-codes";

export const createWallet = async (
  userId: Types.ObjectId,
  session: ClientSession
) => {
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
    console.log("create wallet error:", error);
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpsStatusCodes.INTERNAL_SERVER_ERROR,
      "Wallet creation error."
    );
  }
};
