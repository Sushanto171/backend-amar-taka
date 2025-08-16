/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum IAuditStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REVERSED = "REVERSED",
  EXPIRED = "EXPIRED",
  ON_HOLD = "ON_HOLD",
}

export enum IAuditActionType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  P2P_TRANSFER = "P2P_TRANSFER",
  MERCHANT_PAYMENT = "MERCHANT_PAYMENT",
  BILL_PAYMENT = "BILL_PAYMENT",
}

export interface IAuditLogs {
  _id?: Types.ObjectId;
  actor: Types.ObjectId; //initiate user id
  target: Types.ObjectId; // destination user id
  action: IAuditActionType;
  status: IAuditStatus;
  ipAddress: string;
  device: string;
  metadata: Record<string, any>;
}
