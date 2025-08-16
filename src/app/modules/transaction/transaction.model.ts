import { model, Schema } from "mongoose";
import { IRole } from "../user/user.interface";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>({
  wallet: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Wallet",
    index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    enum: [...Object.values(ITransactionType)],
    required: true,
  },
  status: {
    type: String,
    enum: [...Object.values(ITransactionStatus)],
    required: true,
  },
  destinationWallet: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Wallet",
  },
  reference: { type: String, sparse: true, unique: true },
  fee: { type: Number, required: true, min: 0 },
  initiateRole: {
    type: String,
    enum: [...Object.values(IRole)],
    required: true,
  },
  bankAccount: { type: String },
  metaData: { type: Schema.Types.Mixed, default: {} },
});

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
