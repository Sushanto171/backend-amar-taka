"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePercent = void 0;
const env_config_1 = require("../config/env.config");
const calculatePercent = (payload) => {
    let deductFee;
    let agentRevenue;
    let systemRevenue;
    if (payload.type === "DEPOSIT") {
        deductFee =
            (Number(payload.amount) * env_config_1.envVars.DEPOSIT.DEPOSIT_PERCENT_FEE) / 100;
        agentRevenue =
            (deductFee * env_config_1.envVars.DEPOSIT.AGENT_DEPOSIT_REVENUE_PERCENT) / 100;
        systemRevenue = deductFee - agentRevenue;
    }
    if (payload.type === "WITHDRAW") {
        deductFee =
            (Number(payload.amount) * env_config_1.envVars.WITHDRAW.WITHDRAW_PERCENT_FEE) / 100;
        agentRevenue =
            (deductFee * env_config_1.envVars.WITHDRAW.AGENT_WITHDRAW_REVENUE_PERCENT) / 100;
        systemRevenue = deductFee - agentRevenue;
    }
    if (payload.type === "P2P") {
        deductFee = (payload.amount / 100000) * env_config_1.envVars.P2P.P2P_PER_THOUSAND_CHARGE;
        systemRevenue = deductFee;
    }
    return { deductFee, agentRevenue, systemRevenue };
};
exports.calculatePercent = calculatePercent;
