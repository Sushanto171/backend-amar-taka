import { ClientSession, Types } from "mongoose";
import { Wallet } from "../modules/wallet/wallet.model";

export enum IncType {
  increment = "+",
  decrement = "-",
}

export interface IUpdateTBalance {
  walletId: Types.ObjectId;
  balance: number;
  session: ClientSession;
  incType: IncType;
  revenue?: number;
}

export const updateTransactionBalance = async (payload: IUpdateTBalance) => {
  const user = await Wallet.findByIdAndUpdate(
    payload.walletId,
    {
      $inc: {
        balance: payload.incType + payload.balance,
        ...(payload.revenue && { revenue: +payload.revenue }),
      },
    },
    { session: payload.session, runValidators: true, new: true }
  );
  return user;
};
