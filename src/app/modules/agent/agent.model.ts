import { model, Schema } from "mongoose";
import {
  IAgent,
  IAgentStatus,
  IKYCStatus,
  INidPhotoType,
} from "./agent.interface";

const nidPhotoSchema = new Schema<INidPhotoType>(
  {
    frontend: { type: String },
    backend: { type: String },
  },
  { versionKey: false, _id: false }
);

const agentSchema = new Schema<IAgent>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    wallet: { type: Schema.Types.ObjectId, required: true, ref: "Wallet" },
    agentCode: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    nidNumber: { type: String, required: true, unique: true },
    nidPhotoUrl: { type: String },
    commissionRate: { type: String },
    serviceAreas: nidPhotoSchema,
    kycStatus: {
      type: String,
      enum: Object.values(IKYCStatus),
      default: IKYCStatus.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(IAgentStatus),
      default: IAgentStatus.ACTIVE,
    },
    metaData: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Agent = model<IAgent>("Agent", agentSchema);
