import { model, Schema } from "mongoose";

import {
  IAuditActionType,
  IAuditLogs,
  IAuditStatus,
  IDeviceInfo,
} from "./auditLogs.interface";

const DeviceInfoSchema = new Schema<IDeviceInfo>(
  {
    browser: { type: String, required: true },
    os: { type: String, required: true },
    deviceType: { type: String, required: true },
    brand: { type: String },
    rawUserAgent: { type: String, required: true },
  },
  { _id: false, versionKey: false }
);

const AuditLogsSchema = new Schema<IAuditLogs>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actorWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    targetWallet: { type: Schema.Types.ObjectId, ref: "Wallet" },
    action: {
      type: String,
      enum: Object.values(IAuditActionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(IAuditStatus),
      required: true,
    },
    ipAddress: { type: String, required: true },
    device: { type: DeviceInfoSchema, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
);

export const AuditLogs = model<IAuditLogs>("AuditLog", AuditLogsSchema);
