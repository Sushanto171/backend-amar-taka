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
exports.commissionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const commIssion_service_1 = require("./commIssion.service");
const getAllCommissions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield commIssion_service_1.commissionService.getAllCommissions(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Retrieved all commissions successfully.",
        data: info.commissions,
        meta: info.meta,
    });
}));
const getCommissions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const commissions = yield commIssion_service_1.commissionService.getCommissions(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Retrieved all commissions successfully.",
        data: commissions,
    });
}));
const getSingleCommission = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const commissionId = req.params.commissionId;
    const commission = yield commIssion_service_1.commissionService.getSingleCommission(userId, commissionId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Retrieved a commission successfully.",
        data: commission,
    });
}));
exports.commissionController = {
    getAllCommissions,
    getCommissions,
    getSingleCommission,
};
