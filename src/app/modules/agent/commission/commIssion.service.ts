import { Types } from "mongoose";
import { Commission } from "./commission.model";

const getCommissions = async (userId: Types.ObjectId) => {
  console.log(userId);
  const commissions = await Commission.find({ user: userId });
  return commissions;
};

export const commissionService = {
  getCommissions,
};
