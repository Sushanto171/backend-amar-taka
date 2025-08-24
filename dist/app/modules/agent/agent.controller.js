"use strict";
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
exports.agentController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const agent_service_1 = require("./agent.service");
const registration = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationInfo = yield agent_service_1.agentService.registration(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        message: "Agent registration successfully.",
        data: registrationInfo,
    });
}));
const getSingleAgent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agentId = req.params.agentId;
    const agentInfo = yield agent_service_1.agentService.getSingleAgent(agentId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Agent retrieved successfully",
        data: agentInfo,
    });
}));
const verifyAgent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield agent_service_1.agentService.verifyAgent(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Agent status updated successfully",
        data: agent,
    });
}));
const updateAgent = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const agentId = req.params.agentId;
    const updatedInfo = yield agent_service_1.agentService.updateAgent(decoded, agentId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Agent info updated successfully",
        data: updatedInfo,
    });
}));
const allAgents = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield agent_service_1.agentService.allAgents(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "All agents retrieved successfully.",
        data: info.agents,
        meta: info.meta,
    });
}));
exports.agentController = {
    registration,
    getSingleAgent,
    verifyAgent,
    updateAgent,
    allAgents,
};
