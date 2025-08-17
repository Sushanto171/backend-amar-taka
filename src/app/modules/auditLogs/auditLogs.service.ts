import { Request } from "express";
import { ClientSession } from "mongoose";
import { getClientInfo } from "../../utils/userAgent";
import { IAuditLogs } from "./auditLogs.interface";
import { AuditLogs } from "./auditLogs.model";

type ILog = Pick<
  IAuditLogs,
  | "action"
  | "actor"
  | "actorWallet"
  | "targetWallet"
  | "status"
  | "targetUser"
  | "metadata"
>;

const createAuditLog = async (
  req: Request,
  payload: ILog,
  session?: ClientSession
) => {
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
  await AuditLogs.create([logPayload], { session });
  return {};
};

export const auditLogs = {
  createAuditLog,
};
