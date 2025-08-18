import { Request } from "express";
import { AppError } from "../errorHelpers/AppError";
import {
  ITransaction,
  ITransactionType,
} from "../modules/transaction/transaction.interface";
import { IRole } from "../modules/user/user.interface";
import { httpsStatusCodes } from "./https-status-codes";

export const checkTransactionTypeWithRole = (
  userRole: IRole,
  payload: ITransaction
) => {
  if (
    (userRole === IRole.USER && payload.type === ITransactionType.CASH_IN) ||
    (userRole === IRole.AGENT && payload.type === ITransactionType.CASH_OUT) ||
    !(payload.type === ITransactionType.P2P_TRANSFER && userRole === IRole.USER)
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Your are to permitted for this action!"
    );
  }
};

export const checkSameNumber = (req: Request) => {
  if (req.body.phone === req.user.phone) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Your can't transaction with some number!"
    );
  }
};
