/* eslint-disable no-console */
import { startSession } from "mongoose";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { IRole, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { IWallet, IWalletType } from "../modules/wallet/wallet.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { hashPassword } from "./bcryptjs";
import { httpsStatusCodes } from "./https-status-codes";

type IAdminWallet = Pick<
  IWallet,
  "user" | "balance" | "currency" | "revenue" | "type" | "metadata" | "isBlock"
>;

export const seedAdmin = async () => {
  try {
    const session = await startSession();
    session.startTransaction();
    const isAdminExist = await User.findOne({
      phone: envVars.ADMIN.ADMIN_PHONE,
    });
    if (isAdminExist) {
      console.log("Welcome ❤️‍🔥.. Admin already exist.");
      session.endSession();
      return;
    }

    const hashedPassword = await hashPassword(
      envVars.ADMIN.ADMIN_PASSWORD,
      envVars.BCRYPT_SALT_ROUND
    );

    const adminPayload: IUser = {
      name: envVars.ADMIN.ADMIN_NAME,
      phone: envVars.ADMIN.ADMIN_PHONE,
      email: envVars.ADMIN.ADMIN_EMAIL,
      isVerified: true,
      password: hashedPassword,
      role: IRole.ADMIN,
    };

    const adminArray = await User.create([adminPayload], { session });
    const admin = adminArray[0].toObject();

    const walletPayload: IAdminWallet = {
      user: admin._id,
      balance: envVars.ADMIN.ADMIN_INITIAL_SYSTEM_FUND,
      type: IWalletType.SYSTEM,
      revenue: 0,
    };
    const walletArray = await Wallet.create([walletPayload], { session });
    await User.findByIdAndUpdate(
      admin._id,
      { wallet: walletArray[0]._id },
      { session }
    );
    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    console.log("Admin creation Error:", error);
    throw new AppError(
      httpsStatusCodes.INTERNAL_SERVER_ERROR,
      "Admin creation error"
    );
  }
};
