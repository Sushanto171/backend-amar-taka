import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { IAgent, IAgentStatus } from "../modules/agent/agent.interface";
import { ITransactionType } from "../modules/transaction/transaction.interface";
import { IRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { IWallet } from "../modules/wallet/wallet.interface";
import { comparePassword } from "../utils/bcryptjs";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const checkWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const plainPassword = req.body.password;
    const transactionType = req.body.type;
    const isUserExist = await User.findById(userId)
      .select("+password")
      .populate(["agent", "wallet"]);

    if (!isUserExist) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
    }
    const matchedPassword = await comparePassword(
      isUserExist.password,
      plainPassword
    );

    if (!matchedPassword) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Invalid password!");
    }

    if (
      !(isUserExist.wallet && (isUserExist.wallet as unknown as IWallet)._id)
    ) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "Wallet does not found!");
    }
    if (
      isUserExist.role === IRole.AGENT &&
      !(isUserExist.agent && (isUserExist.agent as unknown as IAgent)._id)
    ) {
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

    // if (
    //   (isUserExist.role === IRole.USER &&
    //     transactionType === ITransactionType.CASH_IN) ||
    //   (isUserExist &&
    //     isUserExist.role === IRole.AGENT &&
    //     transactionType === ITransactionType.CASH_OUT)
    // ) {
    //   throw new AppError(
    //     httpsStatusCodes.NOT_ACCEPTABLE,
    //     "Your are to permitted for this action!"
    //   );
    // }

    req.user = {
      userId: isUserExist._id,
      wallet: isUserExist.wallet,
    };
    next();
  } catch (error) {
    next(error);
  }
};
