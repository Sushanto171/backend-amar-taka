import { ICreateAudit } from "../auditLogs/auditLogs.service";
import { ICommission } from "../commission/commission.interface";

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

export interface IEvents {
  commission: ICommission;
  log: ICreateAudit;
  sendSms: ISendSms;
}
