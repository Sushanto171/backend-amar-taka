import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { IAgent, IAgentStatus } from "../modules/agent/agent.interface";
import { User } from "../modules/user/user.model";
import { IWallet } from "../modules/wallet/wallet.interface";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const checkAgent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const isUserExist = await User.findById(userId).populate([
      "agent",
      "wallet",
    ]);

    if (!isUserExist) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
    }

    if (
      !(isUserExist.wallet && (isUserExist.wallet as unknown as IWallet)._id)
    ) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "Wallet does not found!");
    }

    if (!(isUserExist.agent && (isUserExist.agent as unknown as IAgent)._id)) {
      throw new AppError(
        httpsStatusCodes.NOT_ACCEPTABLE,
        "Transaction failed: The destination wallet is currently blocked. Please contact support for assistance."
      );
    }
    if (
      isUserExist.agent &&
      ((isUserExist.agent as unknown as IAgent).status ===
        IAgentStatus.INACTIVE ||
        (isUserExist.wallet as unknown as IWallet).isBlock)
    ) {
      throw new AppError(
        httpsStatusCodes.NOT_ACCEPTABLE,
        `Transaction failed: The destination user is currently ${
          (isUserExist.agent as unknown as IAgent).status ||
          (isUserExist.wallet as unknown as IWallet).isBlock
            ? "Blocked"
            : ""
        } . Please contact support for assistance.`
      );
    }

    req.user = {
      ...req.user,
      agentId: isUserExist.agent,
      walletId: isUserExist.wallet,
    };
    next();
  } catch (error) {
    next(error);
  }
};
