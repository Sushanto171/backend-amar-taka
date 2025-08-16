import mongoose, { Types } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { User } from "../user/user.model";
import { IAgent } from "./agent.interface";
import { Agent } from "./agent.model";

const registration = async (
  userId: string,
  payload: Pick<
    IAgent,
    "agentCode" | "licenseNumber" | "nidNumber" | "nidPhotoUrl" | "serviceAreas"
  >
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  const isRegistrationExist = await Agent.findOne({
    user: new mongoose.Types.ObjectId(userId),
  });
  if (isRegistrationExist) {
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      "Your are already registered"
    );
  }
  const agentPayload: IAgent = {
    user: user._id,
    wallet: user.wallet as Types.ObjectId,
    ...payload,
  };
  const agent = await Agent.create(agentPayload);
  return agent;
};

const getSingleAgent = async () => {
  return {};
};

// admin route
const verifyAgent = async () => {
  return {};
};

const updateAgent = async () => {
  return {};
};

const allAgents = async () => {
  return {};
};

export const agentService = {
  registration,
  getSingleAgent,
  verifyAgent,
  updateAgent,
  allAgents,
};
