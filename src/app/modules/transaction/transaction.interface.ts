import { Types } from "mongoose";

export enum ITransactionType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  P2P_TRANSFER = "P2P_TRANSFER", //send money user wallet to user wallet
  MERCHANT_PAYMENT = "MERCHANT_PAYMENT",
  BILL_PAYMENT = "BILL_PAYMENT",
}

export enum ITransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REVERSED = "REVERSED",
  EXPIRED = "EXPIRED",
  ON_HOLD = "ON_HOLD",
}

export interface ITransaction {
  _id?: Types.ObjectId;
  fromWallet: Types.ObjectId;
  toWallet: Types.ObjectId;
  type: ITransactionType;
  status: ITransactionStatus;
  amount: number;
  reference: string;
  fee: number;
  bankAccount?: string;
  metaData?: unknown;
}
