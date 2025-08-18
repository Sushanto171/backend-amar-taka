import { ClientSession } from "mongoose";
import { AppError } from "../errorHelpers/AppError";
import { IAgent, IAgentStatus } from "../modules/agent/agent.interface";
import { IRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { IWallet } from "../modules/wallet/wallet.interface";
import { httpsStatusCodes } from "./https-status-codes";

export const checkAccountAndWalletHealth = async (
  phone: string,
  session: ClientSession,
  checkAgent?: IRole
) => {
  const isUserExist = await User.findOne({ phone })
    .populate(["wallet", "agent"])
    .session(session);
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
  }
  if (!checkAgent?.includes(isUserExist.role)) {
    console.log(checkAgent?.includes(isUserExist.role), isUserExist);
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      `This user is not ${checkAgent}`
    );
  }

  if (isUserExist.isDeleted || isUserExist.isSuspended) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      `Transaction Failed: can't deposit to ${
        (isUserExist.isDeleted && "Deleted") ||
        (isUserExist.isSuspended && "Suspended")
      }`
    );
  }

  if (
    isUserExist.wallet &&
    (isUserExist.wallet as unknown as IWallet).isBlock
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Transaction failed: The destination wallet is currently blocked. Please contact support for assistance."
    );
  }
  if (
    isUserExist.agent &&
    (isUserExist.agent as unknown as IAgent).status === IAgentStatus.INACTIVE
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      `Transaction failed: The destination user is currently ${
        (isUserExist.agent as unknown as IAgent).status
      } . Please contact support for assistance.`
    );
  }
  const user = {
    user: isUserExist,
    wallet: isUserExist.wallet && isUserExist.wallet._id,
    agent: isUserExist.agent && isUserExist.agent._id,
  };
  return  user ;
};
