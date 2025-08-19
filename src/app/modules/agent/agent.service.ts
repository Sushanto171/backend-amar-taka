import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { startSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import { IAuditActionType } from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { transactionService } from "../transaction/transaction.service";
import { IRole, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { IWalletType } from "../wallet/wallet.interface";
import { Wallet } from "../wallet/wallet.model";
import { IAgent, IKYCStatus } from "./agent.interface";
import { Agent } from "./agent.model";
type IPayload = Pick<
  IAgent,
  "agentCode" | "licenseNumber" | "nidNumber" | "nidPhotoUrl" | "serviceAreas"
>;

const registration = async (req: Request) => {
  const agentId = req.user.agent;
  const userId = req.user.userId;
  const payload: IPayload = req.body;
  const session = await startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
    }
    const isRegistrationExist = await Agent.findById(agentId).session(session);
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

    await auditLogsService.createAuditLog({
      payload: {
        action: IAuditActionType.REGISTRATION_AGENT,
        actor: user._id,
        actorWallet: user.wallet,
        status: ITransactionStatus.PENDING,
        metadata: { message: "Agent registration success." },
      },
      req,
      session,
    });
    await session.commitTransaction();
    return agent;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const getSingleAgent = async (agentId: string) => {
  const agentInfo = await Agent.findById(agentId);
  return agentInfo;
};

// admin route
const verifyAgent = async (req: Request) => {
  const payload: Pick<IAgent, "kycStatus"> = req.body;
  const agentId = req.params.agentId;
  const session = await startSession();
  session.startTransaction();
  let agent;
  let user;
  try {
    const isRegistrationExist = await Agent.findById(agentId)
      .populate("user")
      .session(session);

    if (!isRegistrationExist) {
      throw new AppError(httpsStatusCodes.NOT_FOUND, "Agent does not found");
    }
    if (payload.kycStatus === IKYCStatus.VERIFIED) {
      agent = await Agent.findByIdAndUpdate(
        agentId,
        { kycStatus: payload.kycStatus },
        { session, new : true, runValidators: true }
      );
      await User.findByIdAndUpdate(
        isRegistrationExist.user,
        { role: IRole.AGENT },
        { session }
      );
      await Wallet.findByIdAndUpdate(
        isRegistrationExist.wallet,
        {
          $inc: { balance: +envVars.AGENT.AGENT_INITIAL_BALANCE },
          type: IWalletType.AGENT,
          revenue: 0,
        },
        { session }
      );

      const system = await updateSystemWallet({
        session,
        amount: envVars.AGENT.AGENT_INITIAL_BALANCE,
      });

      user = isRegistrationExist.user as unknown as IUser;

      await auditLogsService.createAuditLog({
        payload: {
          action: IAuditActionType.REGISTRATION_AGENT,
          actor: req.user.userid,
          targetUser: user._id,
          status: ITransactionStatus.VERIFIED,
          metadata: {
            message: "Agent registration success.",
            agentId: new mongoose.Types.ObjectId(agentId),
          },
        },
        req,
        session,
      });

      const transactionPayload: ITransaction = {
        amount: envVars.AGENT.AGENT_INITIAL_BALANCE, //paisa
        fromWallet: system?._id as Types.ObjectId,
        toWallet: isRegistrationExist.wallet,
        phone: user.phone,
        fee: 0,
        status: ITransactionStatus.SUCCESS,
        type: ITransactionType.CASH_IN,
        reference: `new-agent-balance-${Date.now()}`,
      };

      await transactionService.createTransaction(
        req,
        transactionPayload,
        session
      );
    }
    if (payload.kycStatus === IKYCStatus.REJECTED) {
      await Agent.findByIdAndUpdate(
        agentId,
        { kycStatus: IKYCStatus.REJECTED },
        { session }
      );
      await auditLogsService.createAuditLog({
        payload: {
          action: IAuditActionType.REGISTRATION_AGENT,
          actor: req.user.userid,
          targetUser: user?._id,
          status: ITransactionStatus.REJECTED,
          metadata: {
            message: "Agent registration rejected.",
            agentId: new mongoose.Types.ObjectId(agentId),
          },
        },
        req,
        session,
      });
    }

    await session.commitTransaction();
    return agent;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const updateAgent = async (
  user: JwtPayload,
  agentId: string,
  payload: Partial<IAgent>
) => {
  const isExistAgent = await Agent.findById(agentId);
  if (!isExistAgent) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "Agent does not found");
  }
  if (user.role !== IRole.ADMIN && payload.status) {
    throw new AppError(
      httpsStatusCodes.FORBIDDEN,
      "Your are not permitted this action"
    );
  }
  const agent = await Agent.findByIdAndUpdate(agentId, payload, {
    runValidators: true,
    new: true,
  });
  return agent;
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
