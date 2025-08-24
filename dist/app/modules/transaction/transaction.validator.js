"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionActionZodSchema = exports.transactionZodSchema = void 0;
const zod_1 = require("zod");
const transaction_interface_1 = require("./transaction.interface");
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
// Transaction Zod Schema
exports.transactionZodSchema = zod_1.z.object({
    phone: zod_1.z
        .string({
        error: "Phone number is required",
    })
        .regex(bdPhoneRegex, { message: "Invalid Bangladesh phone number format" }),
    amount: zod_1.z.preprocess((val) => (typeof val === "string" ? Number(val) : val), zod_1.z.number().positive("Amount must be greater than 0")),
    reference: zod_1.z.string().optional(),
    type: zod_1.z.enum([...Object.values(transaction_interface_1.ITransactionType)]),
    bankAccount: zod_1.z.string().optional(),
    metaData: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(), // flexible metadata
});
exports.transactionActionZodSchema = zod_1.z.object({
    transactionId: zod_1.z.string({ error: "Transaction id is required!" }),
    password: zod_1.z.string("Password is required!"),
});
