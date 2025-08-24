"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const https_status_codes_1 = require("../utils/https-status-codes");
const handleZodError = (error) => {
    const formatted = error.issues.map((error) => ({
        path: error.path.join("."),
        message: error.message,
    }));
    return {
        errorSource: formatted,
        message: error.name,
        status: https_status_codes_1.httpsStatusCodes.BAD_REQUEST,
    };
};
exports.handleZodError = handleZodError;
