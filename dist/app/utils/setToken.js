"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const cookieOptions_1 = require("./cookieOptions");
const setAuthCookie = (res, token) => {
    if (token.accessToken) {
        res.cookie("accessToken", token.accessToken, cookieOptions_1.cookieOptions);
    }
    if (token.refreshToken) {
        res.cookie("refreshToken", token.refreshToken, cookieOptions_1.cookieOptions);
    }
};
exports.setAuthCookie = setAuthCookie;
