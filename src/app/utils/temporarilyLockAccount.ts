import { ClientSession, Types } from "mongoose";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { httpsStatusCodes } from "./https-status-codes";

export const temporarilyLockAccount = async (
  userId: Types.ObjectId,
  session: ClientSession
) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { failedLoginAttempts: +1 },
    },
    { new: true, runValidators: true, session }
  );
  if (
    updatedUser &&
    updatedUser.failedLoginAttempts &&
    updatedUser.failedLoginAttempts >= 3
  ) {
    updatedUser.lockUntil = Date.now() + envVars.ADMIN.LOCK_LOGIN_UNTIL;
    await updatedUser.save({ session });
  }
  await session.commitTransaction();
  await session.endSession();
  throw new AppError(httpsStatusCodes.BAD_REQUEST, "Invalid password");
};
