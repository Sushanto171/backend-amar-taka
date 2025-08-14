import { Types } from "mongoose";

export enum ICurrency {
  BDT = "BDT",
  USD = "USD",
}

export enum IWalletType {
  PERSONAL = "PERSONAL",
  AGENT = "AGENT",
}

export interface ILimit {
  daily: number;
  monthly: number;
}

export interface IWallet {
  user: Types.ObjectId;
  balance: number;
  currency?: ICurrency;
  type: IWalletType;
  isBlock?: boolean;
  metadata?: unknown;
  limit: ILimit;
  revenue?: number; //only for agent/admin
}
