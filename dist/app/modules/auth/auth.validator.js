"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.resetPasswordZodSchema = zod_1.default.object({
    otp: zod_1.default.string({ error: "OTP must be required" }),
    phone: zod_1.default.string({ error: "Phone must be required" }),
    password: zod_1.default.string({ error: "Password must be required" }),
});
