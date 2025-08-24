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
exports.auditController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const auditLogs_service_1 = require("./auditLogs.service");
const getLogs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield auditLogs_service_1.auditLogsService.getLogs(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Retrieved all logs data",
        data: info.logs,
        meta: info.meta,
    });
}));
const getSingleLog = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const logId = req.params.logId;
    const log = yield auditLogs_service_1.auditLogsService.getSingleLogs(logId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Retrieved all logs data",
        data: log,
    });
}));
exports.auditController = {
    getLogs,
    getSingleLog,
};
