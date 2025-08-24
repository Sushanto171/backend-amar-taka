"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredVars = [
    "PORT",
    "NODE_ENV",
    "DB_URL",
    "BCRYPT_SALT_ROUND",
    "ADMIN_PHONE",
    "ADMIN_PASSWORD",
    "ADMIN_NAME",
    "ADMIN_INITIAL_SYSTEM_FUND",
    "USER_WELCOME_BONUS",
    "USER_DAILY_CASHOUT_LIMIT",
    "USER_MONTHLY_CASHOUT_LIMIT",
    "AGENT_INITIAL_BALANCE",
    "AGENT_DAILY_CASHOUT_LIMIT",
    "AGENT_MONTHLY_CASHOUT_LIMIT",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRATION",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRATION",
    "ADMIN_EMAIL",
    "LOCK_LOGIN_UNTIL",
    "MINIMUM_DEPOSIT_AMOUNT",
    "DEPOSIT_PERCENT_FEE",
    "SYSTEM_DEPOSIT_REVENUE_PERCENT",
    "AGENT_DEPOSIT_REVENUE_PERCENT",
    "MINIMUM_WITHDRAW_AMOUNT",
    "WITHDRAW_PERCENT_FEE",
    "SYSTEM_WITHDRAW_REVENUE_PERCENT",
    "AGENT_WITHDRAW_REVENUE_PERCENT",
    "P2P_PER_THOUSAND_CHARGE",
    "ACCOUNT_SID",
    "AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "REDIS_PASSWORD",
    "REDIS_HOST",
    "REDIS_PORT",
];
const loadEnvVariables = () => {
    requiredVars.forEach((variable) => {
        if (!process.env[variable])
            throw new Error(`Missing env variable: ${variable}`);
    });
    return {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        DB_URL: process.env.DB_URL,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
        ADMIN: {
            ADMIN_PHONE: process.env.ADMIN_PHONE,
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
            ADMIN_EMAIL: process.env.ADMIN_EMAIL,
            ADMIN_NAME: process.env.ADMIN_NAME,
            ADMIN_INITIAL_SYSTEM_FUND: Number(process.env.ADMIN_INITIAL_SYSTEM_FUND),
            LOCK_LOGIN_UNTIL: Number(process.env.LOCK_LOGIN_UNTIL),
        },
        USER: {
            USER_WELCOME_BONUS: Number(process.env.USER_WELCOME_BONUS),
            USER_DAILY_CASHOUT_LIMIT: Number(process.env.USER_DAILY_CASHOUT_LIMIT),
            USER_MONTHLY_CASHOUT_LIMIT: Number(process.env.USER_MONTHLY_CASHOUT_LIMIT),
        },
        AGENT: {
            AGENT_INITIAL_BALANCE: Number(process.env.AGENT_INITIAL_BALANCE),
            AGENT_DAILY_CASHOUT_LIMIT: Number(process.env.AGENT_DAILY_CASHOUT_LIMIT),
            AGENT_MONTHLY_CASHOUT_LIMIT: Number(process.env.AGENT_MONTHLY_CASHOUT_LIMIT),
        },
        JWT: {
            JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
            JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION,
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
            JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION,
        },
        DEPOSIT: {
            MINIMUM_DEPOSIT_AMOUNT: Number(process.env.MINIMUM_DEPOSIT_AMOUNT),
            DEPOSIT_PERCENT_FEE: Number(process.env.DEPOSIT_PERCENT_FEE),
            SYSTEM_DEPOSIT_REVENUE_PERCENT: Number(process.env.SYSTEM_DEPOSIT_REVENUE_PERCENT),
            AGENT_DEPOSIT_REVENUE_PERCENT: Number(process.env.AGENT_DEPOSIT_REVENUE_PERCENT),
        },
        WITHDRAW: {
            MINIMUM_WITHDRAW_AMOUNT: Number(process.env.MINIMUM_WITHDRAW_AMOUNT),
            WITHDRAW_PERCENT_FEE: Number(process.env.WITHDRAW_PERCENT_FEE),
            SYSTEM_WITHDRAW_REVENUE_PERCENT: Number(process.env.SYSTEM_WITHDRAW_REVENUE_PERCENT),
            AGENT_WITHDRAW_REVENUE_PERCENT: Number(process.env.AGENT_WITHDRAW_REVENUE_PERCENT),
        },
        P2P: {
            P2P_PER_THOUSAND_CHARGE: Number(process.env.P2P_PER_THOUSAND_CHARGE),
        },
        TWILIO: {
            ACCOUNT_SID: process.env.ACCOUNT_SID,
            AUTH_TOKEN: process.env.AUTH_TOKEN,
            TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        },
        REDIS: {
            REDIS_PASSWORD: process.env.REDIS_PASSWORD,
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: Number(process.env.REDIS_PORT),
        },
    };
};
exports.envVars = loadEnvVariables();
