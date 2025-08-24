"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const https_status_codes_1 = require("../utils/https-status-codes");
const handleDuplicateError = (error) => {
    const matchedArray = error.errmsg.match(/"([^"]*)"/);
    return {
        message: `${matchedArray[0]} is Already exist.`,
        status: https_status_codes_1.httpsStatusCodes.CONFLICT,
    };
};
exports.handleDuplicateError = handleDuplicateError;
