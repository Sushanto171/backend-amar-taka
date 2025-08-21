import { ICommission } from "../../commission/commission.interface";
import { Commission } from "../../commission/commission.model";

const createCommission = async (payload: ICommission) => {
  const commission = await Commission.create(payload);
  return commission;
};

export const commissionService = {
  createCommission,
};
