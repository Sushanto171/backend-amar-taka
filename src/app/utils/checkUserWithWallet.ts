import { AppError } from "../errorHelpers/AppError";
import { IUser } from "../modules/user/user.interface";
import { IWallet } from "../modules/wallet/wallet.interface";
import { httpsStatusCodes } from "./https-status-codes";

export const checkUserWithWallet = (
  user: Partial<IUser>,
  wallet: Partial<IWallet>
) => {
  if (user.isDeleted || user.isSuspended) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      `Acton Failed: user is ${
        (user.isDeleted && "Deleted") || (user.isSuspended && "Suspended")
      }`
    );
  }

  if (wallet.isBlock) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Action failed: The wallet is currently blocked. Please contact support for assistance."
    );
  }
};
