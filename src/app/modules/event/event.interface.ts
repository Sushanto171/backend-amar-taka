import { Request } from "express";
import { ICreateAudit } from "../auditLogs/auditLogs.service";
import { ICommission } from "../commission/commission.interface";
import { ITransaction } from "../transaction/transaction.interface";

export interface ISendSms {
  amount?: number;
  agentNumber?: string;
  userNumber?: string;
  transactionId?: string;
  otpCode?: string;
  reference?: string;
  message?: string;
  fee?: number;
  timeStamp: Date;
}

interface TTransactionPayload extends ITransaction {
  req: Request;
}
export interface IEvents {
  commission: ICommission;
  log: ICreateAudit;
  sendSms: ISendSms;
  transaction: TTransactionPayload;
}
