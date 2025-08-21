import { ICommission } from "../../agent/commission/commission.interface";
import { Commission } from "../../agent/commission/commission.model";


const createCommission = async (payload: ICommission) => {
  const commission = await Commission.create(payload);
  return commission;
};

export const commissionService = {
  createCommission,
};
