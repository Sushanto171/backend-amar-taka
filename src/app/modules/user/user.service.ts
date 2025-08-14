import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const isUserExist = await User.findOne({
    $or: [{ phone: payload.phone }, { email: payload.email }],
  });

  if (isUserExist) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "User already exist.");
  }

  // step: 2 create user
  const user = await User.create(payload);

  return { user };
};

const getAllUsers = async () => {
  const users = await User.find();
  return { users };
};

export const userService = {
  createUser,
  getAllUsers,
};
