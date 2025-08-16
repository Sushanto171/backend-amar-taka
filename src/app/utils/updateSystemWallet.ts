import { ClientSession } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import { IWalletType } from "../modules/wallet/wallet.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { httpsStatusCodes } from "./https-status-codes";

export const updateSystemWallet = async (
  amount: number,
  session: ClientSession
) => {
  try {
    const system = await Wallet.findOneAndUpdate(
      { type: IWalletType.SYSTEM },
      { $inc: { balance: -amount } },
      { session, runValidators: true }
    );
    return system;
  } catch (error) {
    console.log("System wallet update error:", error);
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(
      httpsStatusCodes.INTERNAL_SERVER_ERROR,
      "System wallet update error."
    );
  }
};
