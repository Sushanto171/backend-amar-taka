import { envVars } from "../config/env.config";

const calculateDepositPercent = (amount: number) => {
  const deductFee =
    (Number(amount) * envVars.DEPOSIT.DEPOSIT_PERCENT_FEE) / 100;
  const agentRevenue =
    (deductFee * envVars.DEPOSIT.AGENT_DEPOSIT_REVENUE_PERCENT) / 100;
  const systemRevenue = deductFee - agentRevenue;
  return { deductFee, agentRevenue, systemRevenue };
};

export default calculateDepositPercent;
