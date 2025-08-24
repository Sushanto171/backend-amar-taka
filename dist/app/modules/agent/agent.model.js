"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const mongoose_1 = require("mongoose");
const agent_interface_1 = require("./agent.interface");
const nidPhotoSchema = new mongoose_1.Schema({
    frontend: { type: String },
    backend: { type: String },
}, { versionKey: false, _id: false });
const agentSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    wallet: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Wallet" },
    agentCode: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    nidNumber: { type: String, required: true, unique: true },
    nidPhotoUrl: nidPhotoSchema,
    commissionRate: { type: String },
    serviceAreas: { type: [] },
    kycStatus: {
        type: String,
        enum: Object.values(agent_interface_1.IKYCStatus),
        default: agent_interface_1.IKYCStatus.PENDING,
    },
    status: {
        type: String,
        enum: Object.values(agent_interface_1.IAgentStatus),
        default: agent_interface_1.IAgentStatus.ACTIVE,
    },
    metaData: { type: String },
}, {
    versionKey: false,
    timestamps: true,
});
exports.Agent = (0, mongoose_1.model)("Agent", agentSchema);
