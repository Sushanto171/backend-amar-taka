import { Request } from "express";
import { ClientSession } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
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
  const log = await AuditLogs.create([logPayload], session && { session });
  return log;
};

const getLogs = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(AuditLogs.find(), query);
  const auditLog = queryBuilder.filter().fields().sort().paginate();
  const [logs, meta] = await Promise.all([
    auditLog.build().populate("actor", "name phone"),
    auditLog.getMeta(),
  ]);
  return { logs, meta };
};

const getSingleLogs = async (logId: string) => {
  const log = await AuditLogs.findById(logId);
  return log;
};

export const auditLogsService = {
  createAuditLog,
  getLogs,
  getSingleLogs,
};
