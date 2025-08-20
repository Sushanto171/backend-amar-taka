import { Types } from "mongoose";

export interface IEvents {
  commission: {
    fee: number;
    user: Types.ObjectId;
  };
}
