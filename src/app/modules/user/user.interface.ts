import { Types } from "mongoose";

export enum IRole {
  ADMIN = "ADMIN",
  AGENT = "AGENT",
  USER = "USER",
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  phone: string;
  password: string;
  email?: string;
  picture?: string;
  wallet: Types.ObjectId;
  agentId?: Types.ObjectId;
  isVerified: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
  role: IRole;
  failedLoginAttempts: number;
  lockUntil: Date;
}
