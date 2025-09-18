import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { IAgent } from "../modules/agent/agent.interface";
import {
  IAuditActionType,
  IAuditStatus,
} from "../modules/auditLogs/auditLogs.interface";
import { eventBus } from "../modules/event/eventBus";
import { ITransactionStatus } from "../modules/transaction/transaction.interface";
import { Transaction } from "../modules/transaction/transaction.model";
import { IRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { IWallet } from "../modules/wallet/wallet.interface";
import { comparePassword } from "../utils/bcryptjs";
import { checkAgentKycStatus } from "../utils/checkAgentKycStatus";
import { checkUserWithWallet } from "../utils/checkUserWithWallet";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const checkWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.userId;
    const plainPassword = req.body.password;
    const isUserExist = await User.findById(userId)
      .select("+password")
      .populate(["agent", "wallet"]);

    if (!isUserExist) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
    }
    checkUserWithWallet(isUserExist, isUserExist.wallet as unknown as IWallet);

    if (isUserExist.role === IRole.AGENT) {
      checkAgentKycStatus(isUserExist.agent as unknown as IAgent);
    }

    const matchedPassword = await comparePassword(
      isUserExist.password,
      plainPassword
    );

    if (!matchedPassword) {
      const transactionDoc = await Transaction.findByIdAndUpdate(
        req.body.transactionId,
        {
          status: ITransactionStatus.FAILED,
          metaData: { message: "Invalid password" },
        },
        { new: true, runValidators: true }
      );
      const transaction = transactionDoc?.toObject();
      eventBus.emit("log", {
        req,
        payload: {
          action: transaction?.type as unknown as IAuditActionType,
          targetWallet: transaction?.toWallet,
          actor: userId,
          actorWallet: transaction?.fromWallet,
          status: IAuditStatus.FAILED,
          metadata: {
            amount: transaction?.amount,
            message: "Invalid Password",
          },
        },
      });
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "Invalid password!");
    }

    req.user = {
      userId: isUserExist._id,
      role: isUserExist.role,
      phone: isUserExist.phone,
      wallet: isUserExist.wallet as unknown as IWallet, //wallet object
    };
    next();
  } catch (error) {
    next(error);
  }
};
