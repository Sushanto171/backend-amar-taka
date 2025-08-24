import { ClientSession, Types } from "mongoose";
import { IWalletType } from "../modules/wallet/wallet.interface";
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
  type?: IWalletType;
}

export const updateTransactionBalance = async (payload: IUpdateTBalance) => {
  const wallet = await Wallet.findByIdAndUpdate(
    payload.walletId,
    {
      $inc: {
        balance: payload.incType + payload.balance,
        ...(payload.revenue && { revenue: +payload.revenue }),
      },
      ...(payload.type && { type: payload.type }),
    },
    { session: payload.session, runValidators: true, new: true }
  );
  return wallet;
};
