/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export interface INidPhotoType {
  frontend: string;
  backend: string;
}

export interface IAgent {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  wallet: Types.ObjectId;
  agentCode: string;
  licenseNumber: string;
  nidNumber: string;
  nidPhotoUrl?: INidPhotoType;
  commissionRate?: number;
  serviceAreas: string[]; // area names or geo-coordinates
  kycStatus: "PENDING" | "VERIFIED" | "REJECTED";
  status: "ACTIVE" | "INACTIVE";
  metaData?: Record<string, any>;
}
