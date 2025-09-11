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
    (userRole === IRole.AGENT && payload.type !== ITransactionType.CASH_IN) ||
    (userRole === IRole.USER && payload.type === ITransactionType.CASH_IN)
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Your are not permitted for this action!"
    );
  }
};

export const checkSameNumber = (req: Request) => {
  if (req.body?.receiver === req.user?.phone) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      "Your can't transaction with some number!"
    );
  }
};
