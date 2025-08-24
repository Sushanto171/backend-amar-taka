"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.createUserTokens = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const generateToken = (payload, secret, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
    return token;
};
exports.generateToken = generateToken;
const createUserTokens = (user) => {
    const jwtPayload = {
        role: user.role,
        userId: user._id,
        phone: user.phone,
        email: user.email,
    };
    const accessToken = (0, exports.generateToken)(jwtPayload, env_config_1.envVars.JWT.JWT_ACCESS_SECRET, env_config_1.envVars.JWT.JWT_ACCESS_EXPIRATION);
    const refreshToken = (0, exports.generateToken)(jwtPayload, env_config_1.envVars.JWT.JWT_REFRESH_SECRET, env_config_1.envVars.JWT.JWT_REFRESH_EXPIRATION);
    return { accessToken, refreshToken };
};
exports.createUserTokens = createUserTokens;
const verifyToken = (token, secret) => {
    const verify = jsonwebtoken_1.default.verify(token, secret);
    return verify;
};
exports.verifyToken = verifyToken;
