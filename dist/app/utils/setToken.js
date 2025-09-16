"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const env_config_1 = require("../config/env.config");
const setAuthCookie = (res, token) => {
    if (token.accessToken) {
        res.cookie("accessToken", token.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: env_config_1.envVars.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
    }
    if (token.refreshToken) {
        res.cookie("refreshToken", token.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: env_config_1.envVars.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
        });
    }
};
exports.setAuthCookie = setAuthCookie;
