import { AppError } from "../errorHelpers/AppError";
import {
  IAgent,
  IAgentStatus,
  IKYCStatus,
} from "../modules/agent/agent.interface";
import { httpsStatusCodes } from "./https-status-codes";

export const checkAgentKycStatus = (agent: Partial<IAgent>) => {
  if (
    agent.status === IAgentStatus.INACTIVE ||
    agent.kycStatus !== IKYCStatus.VERIFIED
  ) {
    throw new AppError(
      httpsStatusCodes.NOT_ACCEPTABLE,
      `Transaction failed: The destination user is currently ${
        agent.status || agent.kycStatus
      } . Please contact support for assistance.`
    );
  }
};
