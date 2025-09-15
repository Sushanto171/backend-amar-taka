import { model, Schema } from "mongoose";
import { ICommission } from "./commission.interface";

const commissionSchema = new Schema<ICommission>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    transaction: { type: Schema.Types.ObjectId, ref: "Transaction" },
    commission: { type: Number, min: 0, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Commission = model<ICommission>("Commission", commissionSchema);
