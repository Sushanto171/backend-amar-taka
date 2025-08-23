import mongoose, { Types } from "mongoose";
import { QueryBuilder } from "./../../utils/QueryBuilder";
import { Commission } from "./commission.model";

//admin route
const getAllCommissions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Commission.find(), query)
    .sort()
    .paginate();
  const [commissions, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);
  return { commissions, meta };
};
const getCommissions = async (userId: Types.ObjectId) => {
  const commissions = await Commission.find({ user: userId });
  return commissions;
};

const getSingleCommission = async (
  userId: Types.ObjectId,
  commissionId: string
) => {
  const commission = await Commission.findOne({
    id: new mongoose.Types.ObjectId(commissionId),
    user: userId,
  });
  return commission;
};

export const commissionService = {
  getAllCommissions,
  getCommissions,
  getSingleCommission,
};
