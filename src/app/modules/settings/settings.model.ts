import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", SettingsSchema);
