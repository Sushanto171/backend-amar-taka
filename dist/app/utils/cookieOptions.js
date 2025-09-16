"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = void 0;
const env_config_1 = require("../config/env.config");
exports.cookieOptions = {
    httpOnly: true,
    sameSite: env_config_1.envVars.NODE_ENV === "production" ? "none" : "lax",
    secure: true,
    path: "/",
};
