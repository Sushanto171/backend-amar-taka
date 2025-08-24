"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAgentKycStatus = void 0;
const AppError_1 = require("../errorHelpers/AppError");
const agent_interface_1 = require("../modules/agent/agent.interface");
const https_status_codes_1 = require("./https-status-codes");
const checkAgentKycStatus = (agent) => {
    if (agent.status === agent_interface_1.IAgentStatus.INACTIVE ||
        agent.kycStatus !== agent_interface_1.IKYCStatus.VERIFIED) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_ACCEPTABLE, `Transaction failed: The destination user is currently ${agent.status || agent.kycStatus} . Please contact support for assistance.`);
    }
};
exports.checkAgentKycStatus = checkAgentKycStatus;
