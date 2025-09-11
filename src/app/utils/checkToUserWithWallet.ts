import { ClientSession } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import {
  ITransaction,
  ITransactionType,
} from "../modules/transaction/transaction.interface";
import { IRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { checkAgentKycStatus } from "./checkAgentKycStatus";
import { checkUserWithWallet } from "./checkUserWithWallet";
import { httpsStatusCodes } from "./https-status-codes";

export const checkToUserWithWallet = async (
  payload: ITransaction,
  session: ClientSession
) => {
  const phone = payload.receiver;
  let checkToUserRole: IRole;

  const isToUserExist = await User.findOne({ phone })
    .populate(["wallet", "agent"])
    .session(session);
  if (!isToUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
  }

  // transaction type = cash in => to user.role = user || cash out => agent || p2p  => user
  if (payload.type === ITransactionType.CASH_IN) checkToUserRole = IRole.USER;
  else if (payload.type === ITransactionType.CASH_OUT)
    checkToUserRole = IRole.AGENT;
  else checkToUserRole = IRole.USER;

  if (!checkToUserRole.includes(isToUserExist.role)) {
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      `This user is not ${checkToUserRole}`
    );
  }

  if (isToUserExist && isToUserExist.wallet) {
    checkUserWithWallet(isToUserExist, isToUserExist.wallet);
  }

  if (isToUserExist.agent) {
    checkAgentKycStatus(isToUserExist.agent);
  }

  const toUserInfo = {
    user: isToUserExist,
    wallet: isToUserExist.wallet && isToUserExist.wallet._id,
    agent: isToUserExist.agent && isToUserExist.agent._id,
  };

  return toUserInfo;
};
