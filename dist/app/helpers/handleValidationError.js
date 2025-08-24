"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationError = void 0;
const https_status_codes_1 = require("../utils/https-status-codes");
const handleValidationError = (err) => {
    const error = Object.values(err.errors);
    const errorSource = error.map((field) => {
        return { path: field.path, message: field.message };
    });
    return {
        message: "Validation Error",
        status: https_status_codes_1.httpsStatusCodes.BAD_REQUEST,
        errorSource,
    };
};
exports.handleValidationError = handleValidationError;
