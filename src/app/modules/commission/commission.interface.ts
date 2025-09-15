import { Types } from "mongoose";

export interface ICommission {
  user: Types.ObjectId;
  commission: number;
  transaction: Types.ObjectId;
}
