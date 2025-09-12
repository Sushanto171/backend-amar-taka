/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";
import { ITransactionStatus } from "../transaction/transaction.interface";

export enum IAuditStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REVERSED = "REVERSED",
  EXPIRED = "EXPIRED",
  ON_HOLD = "ON_HOLD",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum IAuditActionType {
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
  P2P_TRANSFER = "SEND_MONEY",
  MERCHANT_PAYMENT = "MERCHANT_PAYMENT",
  BILL_PAYMENT = "BILL_PAYMENT",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  LOG_IN = "LOG_IN",
  LOG_OUT = "LOG_OUT",
  REGISTRATION = "REGISTRATION",
  REGISTRATION_USER = "REGISTRATION_USER",
  REGISTRATION_AGENT = "REGISTRATION_AGENT",
}

export interface IAuditMetadata {
  amount?: number;
  transactionId?: Types.ObjectId;
  currency?: string;
  message?: string;
  [key: string]: any;
}

export interface IDeviceInfo {
  browser: string;
  os: string;
  deviceType: string;
  brand: string;
  rawUserAgent: string;
}
export interface IAuditLogs {
  _id?: Types.ObjectId;
  actor: Types.ObjectId | "System"; //initiate user id
  actorWallet?: Types.ObjectId;
  targetUser?: Types.ObjectId;
  targetWallet?: Types.ObjectId; // destination user id
  action: IAuditActionType;
  status: IAuditStatus | ITransactionStatus;
  ipAddress: string;
  device: IDeviceInfo;
  metadata?: IAuditMetadata;
}
