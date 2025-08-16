import { model, Schema } from "mongoose";
import { IRole, IUser } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, min: 1 },
    phone: { type: String, unique: true, required: true, min: 11, max: 14 },
    password: { type: String, required: true, select: false, min: 6, max: 6 },
    picture: { type: String },
    email: { type: String },
    wallet: { type: Schema.ObjectId, ref: "Wallet" },
    agent: { type: Schema.ObjectId, ref: "Agent" },
    role: {
      type: String,
      enum: [...Object.values(IRole)],
      default: IRole.USER,
    },
    failedLoginAttempts: { type: Number, min: 0, max: 3, default: 0 },
    lockUntil: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
