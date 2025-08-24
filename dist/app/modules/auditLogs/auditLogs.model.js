"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogs = void 0;
const mongoose_1 = require("mongoose");
const auditLogs_interface_1 = require("./auditLogs.interface");
const DeviceInfoSchema = new mongoose_1.Schema({
    browser: { type: String, required: true },
    os: { type: String, required: true },
    deviceType: { type: String, required: true },
    brand: { type: String },
    rawUserAgent: { type: String, required: true },
}, { _id: false, versionKey: false });
const AuditLogsSchema = new mongoose_1.Schema({
    actor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: "System" },
    actorWallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    targetUser: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    targetWallet: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    action: {
        type: String,
        enum: Object.values(auditLogs_interface_1.IAuditActionType),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(auditLogs_interface_1.IAuditStatus),
        required: true,
    },
    ipAddress: { type: String, required: true },
    device: { type: DeviceInfoSchema, required: true },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true, versionKey: false });
exports.AuditLogs = (0, mongoose_1.model)("AuditLog", AuditLogsSchema);
