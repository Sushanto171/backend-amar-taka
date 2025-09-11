"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const env_config_1 = require("../../config/env.config");
const AppError_1 = require("../../errorHelpers/AppError");
const https_status_codes_1 = require("../../utils/https-status-codes");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const updateSystemWallet_1 = require("../../utils/updateSystemWallet");
const updateTransactionBalance_1 = require("../../utils/updateTransactionBalance");
const auditLogs_interface_1 = require("../auditLogs/auditLogs.interface");
const eventBus_1 = require("../event/eventBus");
const transaction_interface_1 = require("../transaction/transaction.interface");
const transaction_service_1 = require("../transaction/transaction.service");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const wallet_interface_1 = require("../wallet/wallet.interface");
const agent_interface_1 = require("./agent.interface");
const agent_model_1 = require("./agent.model");
const registration = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const agentId = req.user.agent;
    const userId = req.user.userId;
    const payload = req.body;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const user = yield user_model_1.User.findById(userId).session(session);
        if (!user) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found");
        }
        const isRegistrationExist = yield agent_model_1.Agent.findById(agentId).session(session);
        if (isRegistrationExist) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Your are already registered");
        }
        const agentPayload = Object.assign({ user: user._id, wallet: user.wallet }, payload);
        const agentArray = yield agent_model_1.Agent.create([agentPayload], { session });
        const agent = agentArray[0].toObject();
        yield user_model_1.User.findByIdAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(agent.user) }, { agent: agent._id }, { session });
        yield session.commitTransaction();
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.REGISTRATION_AGENT,
                actor: user._id,
                actorWallet: user.wallet,
                status: transaction_interface_1.ITransactionStatus.PENDING,
                metadata: { message: "Agent registration success." },
            },
        });
        return agent;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const getSingleAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agentInfo = yield agent_model_1.Agent.findById(agentId);
    return agentInfo;
});
// admin route
const verifyAgent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const agentId = req.params.agentId;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    let agent;
    let user;
    try {
        const isRegistrationExist = yield agent_model_1.Agent.findById(agentId)
            .populate("user")
            .session(session);
        if (!isRegistrationExist) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Agent does not found");
        }
        if (payload.kycStatus === agent_interface_1.IKYCStatus.VERIFIED) {
            agent = yield agent_model_1.Agent.findByIdAndUpdate(agentId, { kycStatus: payload.kycStatus, status: payload.status }, { session, new: true, runValidators: true });
            yield user_model_1.User.findByIdAndUpdate(isRegistrationExist.user, { role: user_interface_1.IRole.AGENT }, { session });
            yield (0, updateTransactionBalance_1.updateTransactionBalance)({
                walletId: isRegistrationExist.wallet,
                balance: env_config_1.envVars.AGENT.AGENT_INITIAL_BALANCE,
                incType: updateTransactionBalance_1.IncType.increment,
                session,
                revenue: 0,
                type: wallet_interface_1.IWalletType.AGENT,
            });
            const system = yield (0, updateSystemWallet_1.updateSystemWallet)({
                session,
                amount: env_config_1.envVars.AGENT.AGENT_INITIAL_BALANCE,
            });
            user = isRegistrationExist.user;
            const transactionPayload = {
                amount: env_config_1.envVars.AGENT.AGENT_INITIAL_BALANCE, //paisa
                fromWallet: system === null || system === void 0 ? void 0 : system._id,
                toWallet: isRegistrationExist.wallet,
                receiver: user.phone,
                sender: env_config_1.envVars.ADMIN.ADMIN_PHONE,
                fee: 0,
                status: transaction_interface_1.ITransactionStatus.SUCCESS,
                type: transaction_interface_1.ITransactionType.CASH_IN,
                reference: `new-agent-balance-${Date.now()}`,
            };
            yield transaction_service_1.transactionService.createTransaction(req, transactionPayload, session);
            eventBus_1.eventBus.emit("log", {
                req,
                payload: {
                    action: auditLogs_interface_1.IAuditActionType.REGISTRATION_AGENT,
                    actor: req.user.userid,
                    targetUser: user._id,
                    status: transaction_interface_1.ITransactionStatus.VERIFIED,
                    metadata: {
                        message: "Agent registration success.",
                        agentId: new mongoose_1.default.Types.ObjectId(agentId),
                    },
                },
            });
        }
        if (payload.kycStatus === agent_interface_1.IKYCStatus.REJECTED) {
            yield agent_model_1.Agent.findByIdAndUpdate(agentId, { kycStatus: agent_interface_1.IKYCStatus.REJECTED }, { session });
            eventBus_1.eventBus.emit("log", {
                req,
                payload: {
                    action: auditLogs_interface_1.IAuditActionType.REGISTRATION_AGENT,
                    actor: req.user.userid,
                    targetUser: user === null || user === void 0 ? void 0 : user._id,
                    status: transaction_interface_1.ITransactionStatus.REJECTED,
                    metadata: {
                        message: "Agent registration rejected.",
                        agentId: new mongoose_1.default.Types.ObjectId(agentId),
                    },
                },
            });
        }
        yield session.commitTransaction();
        return agent;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const updateAgent = (user, agentId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistAgent = yield agent_model_1.Agent.findById(agentId);
    if (!isExistAgent) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Agent does not found");
    }
    if (user.role !== user_interface_1.IRole.ADMIN && payload.status) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.FORBIDDEN, "Your are not permitted this action");
    }
    const agent = yield agent_model_1.Agent.findByIdAndUpdate(agentId, payload, {
        runValidators: true,
        new: true,
    });
    return agent;
});
const allAgents = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(agent_model_1.Agent.find(), query);
    const agent = queryBuilder
        .filter()
        .fields()
        .sort()
        .paginate()
        .search(["kycStatus"]);
    const [agents, meta] = yield Promise.all([agent.build(), agent.getMeta()]);
    return { agents, meta };
});
exports.agentService = {
    registration,
    getSingleAgent,
    verifyAgent,
    updateAgent,
    allAgents,
};
