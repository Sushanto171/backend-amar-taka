import { ClientSession, Types } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import { IUser } from "../modules/user/user.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { httpsStatusCodes } from "./https-status-codes";

export const checkAccountAndWalletHealth = async (
  walletId: Types.ObjectId,
  session: ClientSession
) => {
  const isWalletExist = await Wallet.findById(walletId)
    .populate("user")
    .session(session);
  if (!isWalletExist) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpsStatusCodes.NOT_FOUND, "Wallet does not found!");
  }

  if (isWalletExist.isBlock) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Transaction failed: The destination wallet is currently blocked. Please contact support for assistance."
    );
  }
  if (
    isWalletExist.user &&
    ((isWalletExist.user as unknown as IUser).isSuspended ||
      (isWalletExist.user as unknown as IUser).isDeleted)
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      `Transaction failed: The destination user is currently ${
        (isWalletExist.user as unknown as IUser).isSuspended
          ? "Suspended"
          : (isWalletExist.user as unknown as IUser).isDeleted
          ? "Deleted"
          : ""
      } . Please contact support for assistance.`
    );
  }
  return;
};
