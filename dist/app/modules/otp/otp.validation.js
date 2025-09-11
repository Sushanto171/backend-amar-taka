"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPZodSchema = exports.sendOTPZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.sendOTPZodSchema = zod_1.default.object({
    phone: zod_1.default.string({ error: "Phone number must be required" }),
});
exports.verifyOTPZodSchema = zod_1.default.object({
    phone: zod_1.default.string({ error: "Phone number must be required" }),
    otp: zod_1.default
        .string({ error: "OTP must be required" })
        .min(6, { error: "OTP length must be 6 numbers" }),
});
