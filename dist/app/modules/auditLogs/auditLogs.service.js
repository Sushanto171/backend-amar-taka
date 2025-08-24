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
exports.auditLogsService = void 0;
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const userAgent_1 = require("../../utils/userAgent");
const auditLogs_model_1 = require("./auditLogs.model");
const createAuditLog = (logInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const { req, payload, session } = logInfo;
    const userInfo = (0, userAgent_1.getClientInfo)(req);
    const logPayload = Object.assign(Object.assign({}, payload), { ipAddress: userInfo.ip, device: {
            brand: userInfo.brand,
            browser: userInfo.browser,
            deviceType: userInfo.deviceType,
            os: userInfo.os,
            rawUserAgent: userInfo.rawUserAgent,
        } });
    const log = yield auditLogs_model_1.AuditLogs.create([logPayload], session && { session });
    return log;
});
const getLogs = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(auditLogs_model_1.AuditLogs.find(), query);
    const auditLog = queryBuilder.filter().fields().sort().paginate();
    const [logs, meta] = yield Promise.all([
        auditLog.build(),
        auditLog.getMeta(),
    ]);
    return { logs, meta };
});
const getSingleLogs = (logId) => __awaiter(void 0, void 0, void 0, function* () {
    const log = yield auditLogs_model_1.AuditLogs.findById(logId);
    return log;
});
exports.auditLogsService = {
    createAuditLog,
    getLogs,
    getSingleLogs,
};
