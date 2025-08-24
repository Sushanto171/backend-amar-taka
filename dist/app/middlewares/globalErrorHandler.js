"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const env_config_1 = require("../config/env.config");
const AppError_1 = require("../errorHelpers/AppError");
const handleCastError_1 = require("../helpers/handleCastError");
const handleDuplicateError_1 = require("../helpers/handleDuplicateError");
const handleValidationError_1 = require("../helpers/handleValidationError");
const handleZodError_1 = require("../helpers/handleZodError");
const https_status_codes_1 = require("../utils/https-status-codes");
const globalErrorHandler = (error, req, res, next) => {
    if (env_config_1.envVars.NODE_ENV === "development") {
        console.log("GlobalErrorHandler:", error);
    }
    let status = 500;
    let message = error.message || "Something went wrong!";
    let errorSource = [];
    //zod error
    if (error instanceof zod_1.ZodError) {
        const formatted = (0, handleZodError_1.handleZodError)(error);
        message = formatted.message;
        errorSource = formatted === null || formatted === void 0 ? void 0 : formatted.errorSource;
        status = formatted.status;
    }
    //cast error
    else if (error.name === "CastError") {
        const formatted = (0, handleCastError_1.handleCastError)(error);
        message = formatted.message;
        status = formatted.status;
    }
    //validation error
    else if (error.name === "ValidationError") {
        const formatted = (0, handleValidationError_1.handleValidationError)(error);
        message = formatted.message;
        status = formatted.status;
        errorSource = formatted.errorSource;
    }
    //duplicate error
    else if (error.code === 11000) {
        const formatted = (0, handleDuplicateError_1.handleDuplicateError)(error);
        message = formatted.message;
        status = formatted.status;
    }
    else if (error instanceof AppError_1.AppError) {
        message = error.message;
        status = error.statusCode;
    }
    else if (error instanceof Error) {
        message = error.message;
        status = https_status_codes_1.httpsStatusCodes.INTERNAL_SERVER_ERROR;
    }
    res.status(status).json({
        statusCode: status,
        success: false,
        message,
        errorSource,
        error: env_config_1.envVars.NODE_ENV === "development" ? error : null,
        stack: env_config_1.envVars.NODE_ENV === "development" ? error.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
