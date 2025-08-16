import { AppError } from "../../errorHelpers/AppError";
import { comparePassword } from "../../utils/bcryptjs";
import { createUserTokens } from "../../utils/jwt";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { httpsStatusCodes } from "./../../utils/https-status-codes";

const login = async (payload: Pick<IUser, "password" | "phone">) => {
  const isUserExist = await User.findOne({ phone: payload.phone }).select(
    "+password"
  );
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "User does not exist");
  }
  const matchedPassword = comparePassword(
    isUserExist.password,
    payload.password
  );
  if (!matchedPassword) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "Invalid password");
  }
  if (isUserExist.isSuspended || isUserExist.isDeleted) {
    throw new AppError(
      httpsStatusCodes.FORBIDDEN,
      "Access denied. Please contact support."
    );
  }
  const userToken = createUserTokens(isUserExist);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = isUserExist.toObject();
  return {
    user: {
      _id: user._id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    },
    userToken,
  };
};

export const authService = {
  login,
};
