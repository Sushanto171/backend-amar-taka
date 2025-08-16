import mongoose, { startSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { createTransaction } from "../../utils/createTransaction";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { IRole } from "../user/user.interface";
import { User } from "../user/user.model";
import { IWalletType } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import { IAgent, IKYCStatus } from "./agent.interface";
import { Agent } from "./agent.model";

const registration = async (
  userId: string,
  payload: Pick<
    IAgent,
    "agentCode" | "licenseNumber" | "nidNumber" | "nidPhotoUrl" | "serviceAreas"
  >
) => {
  const session = await startSession();
  session.startTransaction();
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
  const agentArray = await Agent.create([agentPayload], { session });
  const agent = agentArray[0].toObject();
  await User.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(agent.user) },
    { agent: agent._id },
    { session }
  );
  await session.commitTransaction();
  await session.endSession();
  return agent;
};

const getSingleAgent = async (agentId: string) => {
  const agentInfo = await Agent.findById(agentId);
  return agentInfo;
};

// admin route
const verifyAgent = async (
  agentId: string,
  payload: Pick<IAgent, "kycStatus">
) => {
  const session = await startSession();
  session.startTransaction();
  const isRegistrationExist = await Agent.findById(agentId);
  if (!isRegistrationExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "Agent does not found");
  }
 
  if (payload.kycStatus === IKYCStatus.VERIFIED) {
    await Agent.findByIdAndUpdate(
      agentId,
      { kycStatus: payload.kycStatus },
      { session }
    );
    await User.findByIdAndUpdate(
      isRegistrationExist.user,
      { role: IRole.AGENT },
      { session }
    );
    await Wallet.findByIdAndUpdate(
      isRegistrationExist.wallet,
      {
        balance: envVars.AGENT.AGENT_INITIAL_BALANCE,
        type: IWalletType.AGENT,
        revenue: 0,
      },
      { session }
    );
    const system = await updateSystemWallet(
      envVars.AGENT.AGENT_INITIAL_BALANCE,
      session
    );
    if (!system) {
      throw new AppError(
        httpsStatusCodes.NOT_FOUND,
        "System wallet does not found"
      );
    }
    const transactionPayload: ITransaction = {
      amount: envVars.AGENT.AGENT_INITIAL_BALANCE, //paisa
      wallet: system._id,
      destinationWallet: isRegistrationExist.wallet,
      fee: 0,
      status: ITransactionStatus.SUCCESS,
      type: ITransactionType.CASH_IN,
      initiateRole: IRole.ADMIN,
      reference: `new-agent-balance-${Date.now()}`,
    };

    await createTransaction(transactionPayload, session);
  }
  if (payload.kycStatus === IKYCStatus.REJECTED) {
    await Agent.findByIdAndUpdate(
      agentId,
      { kycStatus: IKYCStatus.REJECTED },
      { session }
    );
  }

  await session.commitTransaction();
  await session.endSession();
  return {};
};

const updateAgent = async () => {
  return {};
};

const allAgents = async () => {
  const agents = await Agent.find();
  return agents;
};

export const agentService = {
  registration,
  getSingleAgent,
  verifyAgent,
  updateAgent,
  allAgents,
};
