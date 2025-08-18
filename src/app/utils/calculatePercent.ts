import { envVars } from "../config/env.config";

interface IPayload {
  amount: number;
  type: "DEPOSIT" | "WITHDRAW" | "P2P";
}

export const calculatePercent = (payload: IPayload) => {
  let deductFee;
  let agentRevenue;
  let systemRevenue;
  if (payload.type === "DEPOSIT") {
    deductFee =
      (Number(payload.amount) * envVars.DEPOSIT.DEPOSIT_PERCENT_FEE) / 100;
    agentRevenue =
      (deductFee * envVars.DEPOSIT.AGENT_DEPOSIT_REVENUE_PERCENT) / 100;
    systemRevenue = deductFee - agentRevenue;
  }
  if (payload.type === "WITHDRAW") {
    deductFee =
      (Number(payload.amount) * envVars.WITHDRAW.WITHDRAW_PERCENT_FEE) / 100;
    agentRevenue =
      (deductFee * envVars.WITHDRAW.AGENT_WITHDRAW_REVENUE_PERCENT) / 100;
    systemRevenue = deductFee - agentRevenue;
  }
  if (payload.type === "P2P") {
    deductFee = (payload.amount / 100) * envVars.P2P.P2P_PER_THOUSAND_CHARGE;
    systemRevenue = deductFee;
  }
  return { deductFee, agentRevenue, systemRevenue };
};
