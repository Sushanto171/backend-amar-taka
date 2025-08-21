import { Types } from "mongoose";

export interface ICommission {
  user: Types.ObjectId;
  fee: number;
}
