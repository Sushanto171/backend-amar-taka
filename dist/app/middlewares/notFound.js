"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const https_status_codes_1 = require("../utils/https-status-codes");
const sendResponse_1 = require("../utils/sendResponse");
const notFound = (req, res, next) => {
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.NOT_FOUND,
        success: false,
        message: `Sorry! ${req.path} does not found.`,
        data: null,
    });
};
exports.notFound = notFound;
