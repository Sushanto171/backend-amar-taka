import { model, Schema } from "mongoose";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    fromWallet: {
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
    toWallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
    sender: {
      type: String,
      required: true,
      min: 11,
      max: 14,
      ref: "User",
    },
    receiver: {
      type: String,
      required: true,
      min: 11,
      max: 14,
      ref: "User",
    },
    reference: { type: String },
    fee: { type: Number, required: true, min: 0 },
    bankAccount: { type: String },
    metaData: { type: Schema.Types.Mixed, default: {} },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>(
  "Transaction",
  transactionSchema
);
