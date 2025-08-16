/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export interface INidPhotoType {
  frontend: string;
  backend: string;
}

export enum IKYCStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum IAgentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IAgent {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  agentCode: string;
  licenseNumber: string;
  nidNumber: string;
  nidPhotoUrl?: INidPhotoType;
  serviceAreas: string[]; // area names or geo-coordinates
  commissionRate?: number;
  kycStatus?: IKYCStatus;
  status?: IAgentStatus;
  metaData?: Record<string, any>;
}
