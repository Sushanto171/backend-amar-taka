"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletActionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.walletActionZodSchema = zod_1.default.object({
    walletId: zod_1.default.string({ error: "walletId must be required" }),
    isBlock: zod_1.default.boolean({ error: "isBlock must be required" }),
});
