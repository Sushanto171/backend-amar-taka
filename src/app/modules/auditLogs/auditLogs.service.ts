import { Request } from "express";
import { ClientSession } from "mongoose";
import { getClientInfo } from "../../utils/userAgent";
import { IAuditLogs } from "./auditLogs.interface";
import { AuditLogs } from "./auditLogs.model";

export type ILog = Pick<
  IAuditLogs,
  | "action"
  | "actor"
  | "actorWallet"
  | "targetWallet"
  | "status"
  | "targetUser"
  | "metadata"
>;

export interface ICreateAudit {
  req: Request;
  payload: ILog;
  session?: ClientSession;
}

const createAuditLog = async (logInfo: ICreateAudit) => {
  const { req, payload, session } = logInfo;
  const userInfo = getClientInfo(req);
  const logPayload: IAuditLogs = {
    ...payload,
    ipAddress: userInfo.ip,
    device: {
      brand: userInfo.brand,
      browser: userInfo.browser,
      deviceType: userInfo.deviceType,
      os: userInfo.os,
      rawUserAgent: userInfo.rawUserAgent,
    },
  };
  await AuditLogs.create([logPayload], session && { session });
  return {};
};

export const auditLogsService = {
  createAuditLog,
};
