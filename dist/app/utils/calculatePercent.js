"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePercent = void 0;
const env_config_1 = require("../config/env.config");
const settings_service_1 = require("./../modules/settings/settings.service");
const calculatePercent = (payload) => {
    var _a, _b, _c, _d, _e;
    let deductFee;
    let agentRevenue;
    let systemRevenue;
    if (payload.type === "DEPOSIT") {
        deductFee =
            (Number(payload.amount) *
                (((_a = settings_service_1.systemConfig === null || settings_service_1.systemConfig === void 0 ? void 0 : settings_service_1.systemConfig.deposit) === null || _a === void 0 ? void 0 : _a.feePct) ||
                    env_config_1.envVars.DEPOSIT.DEPOSIT_PERCENT_FEE)) /
                100;
        agentRevenue =
            (deductFee *
                (((_b = settings_service_1.systemConfig === null || settings_service_1.systemConfig === void 0 ? void 0 : settings_service_1.systemConfig.deposit) === null || _b === void 0 ? void 0 : _b.agentPct) ||
                    env_config_1.envVars.DEPOSIT.AGENT_DEPOSIT_REVENUE_PERCENT)) /
                100;
        systemRevenue = deductFee - agentRevenue;
    }
    if (payload.type === "WITHDRAW") {
        deductFee =
            (Number(payload.amount) *
                (((_c = settings_service_1.systemConfig === null || settings_service_1.systemConfig === void 0 ? void 0 : settings_service_1.systemConfig.withdraw) === null || _c === void 0 ? void 0 : _c.feePct) ||
                    env_config_1.envVars.WITHDRAW.WITHDRAW_PERCENT_FEE)) /
                100;
        agentRevenue =
            (deductFee *
                (((_d = settings_service_1.systemConfig === null || settings_service_1.systemConfig === void 0 ? void 0 : settings_service_1.systemConfig.withdraw) === null || _d === void 0 ? void 0 : _d.agentPct) ||
                    env_config_1.envVars.WITHDRAW.AGENT_WITHDRAW_REVENUE_PERCENT)) /
                100;
        systemRevenue = deductFee - agentRevenue;
    }
    if (payload.type === "P2P") {
        deductFee =
            (payload.amount / 100000) *
                (((_e = settings_service_1.systemConfig === null || settings_service_1.systemConfig === void 0 ? void 0 : settings_service_1.systemConfig.sendMoney) === null || _e === void 0 ? void 0 : _e.perThousandFee) ||
                    env_config_1.envVars.P2P.P2P_PER_THOUSAND_CHARGE);
        systemRevenue = deductFee;
    }
    return { deductFee, agentRevenue, systemRevenue };
};
exports.calculatePercent = calculatePercent;
