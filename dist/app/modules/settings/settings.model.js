"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SettingsSchema = new mongoose_1.default.Schema({
    sysFund: { type: Number, default: 1000000000 }, // Initial system fund
    deposit: {
        min: { type: Number, default: 5000 }, // Min deposit
        feePct: { type: Number, default: 2 }, // Fee %
        sysPct: { type: Number, default: 25 }, // System share %
        agentPct: { type: Number, default: 75 }, // Agent share %
    },
    withdraw: {
        min: { type: Number, default: 0 }, // Min withdraw
        feePct: { type: Number, default: 2 }, // Fee %
        sysPct: { type: Number, default: 50 }, // System share %
        agentPct: { type: Number, default: 50 }, // Agent share %
    },
    sendMoney: {
        perThousandFee: { type: Number, default: 500 }, // 5 TK
        min: { type: Number, default: 20 }, // Min P2P transfer
    },
    user: {
        welcomeBonus: { type: Number, default: 5000 }, // 50 TK
        dailyLimit: { type: Number, default: 2500000 }, // 25k TK
        monthlyLimit: { type: Number, default: 5000000 }, // 50k TK
    },
    agent: {
        initBal: { type: Number, default: 1000000 }, // Initial agent balance
        dailyLimit: { type: Number, default: 5000000 }, // 50k TK
        monthlyLimit: { type: Number, default: 20000000 }, // 200k TK
    },
}, { timestamps: true });
exports.Settings = mongoose_1.default.model("Settings", SettingsSchema);
