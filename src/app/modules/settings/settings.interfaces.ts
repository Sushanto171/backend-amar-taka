import { Types } from "mongoose";

export interface ISettings {
  sysFund: number; // Initial system fund

  deposit: {
    min: number; // Min deposit
    feePct: number; // Fee percentage
    sysPct: number; // System share %
    agentPct: number; // Agent share %
  };

  withdraw: {
    min: number; // Min withdraw
    feePct: number; // Fee percentage
    sysPct: number; // System share %
    agentPct: number; // Agent share %
  };

  sendMoney: {
    perThousandFee: number; // Fee per 1000
    min: number; // Minimum P2P transfer
  };

  user: {
    welcomeBonus: number; // Signup bonus
    dailyLimit: number; // Daily cashOut limit
    monthlyLimit: number; // Monthly cashOut limit
  };

  agent: {
    initBal: number; // Initial balance
    dailyLimit: number; // Daily cashOut limit
    monthlyLimit: number; // Monthly cashOut limit
  };
}

export interface ISettingsDoc extends ISettings, Document {}

export type ISystemConfig =
  | ({ createdAt: NativeDate; updatedAt: NativeDate } & {
      sysFund: number;
      deposit?:
        | { min: number; feePct: number; sysPct: number; agentPct: number }
        | null
        | undefined;
      withdraw?:
        | { min: number; feePct: number; sysPct: number; agentPct: number }
        | null
        | undefined;
      sendMoney?: { min: number; perThousandFee: number } | null | undefined;
      user?:
        | { welcomeBonus: number; dailyLimit: number; monthlyLimit: number }
        | null
        | undefined;
      agent?:
        | { dailyLimit: number; monthlyLimit: number; initBal: number }
        | null
        | undefined;
    } & { _id: Types.ObjectId } & { __v: number })
  | undefined;
