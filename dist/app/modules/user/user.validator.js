"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPZodSchema = exports.updateUserZodSchema = exports.CreateUserZodSchema = void 0;
const mongoose_1 = require("mongoose");
const zod_1 = require("zod");
const user_interface_1 = require("./user.interface");
// Custom validator for ObjectId
const objectIdSchema = zod_1.z
    .string({
    error: "ObjectId is required",
})
    .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
});
// Bangladesh phone regex: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
exports.CreateUserZodSchema = zod_1.z.object({
    // Required fields
    name: zod_1.z
        .string({
        error: "Invalid name format",
    })
        .min(1, { message: "Name cannot be empty" }),
    phone: zod_1.z
        .string({
        error: "Phone number is required",
    })
        .regex(bdPhoneRegex, { message: "Invalid Bangladesh phone number format" }),
    password: zod_1.z
        .string({
        error: "Password is required",
    })
        .regex(/^\d{6}$/, { message: "Password must be exactly 6 digits." }),
    // Optional fields
    email: zod_1.z.string().email({ message: "Invalid email format" }).optional(),
    picture: zod_1.z.string().url({ message: "Invalid picture URL" }).optional(),
    wallet: objectIdSchema.optional(),
    agentId: objectIdSchema.optional(),
    isVerified: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    isSuspended: zod_1.z.boolean().optional(),
    role: zod_1.z.enum(user_interface_1.IRole).optional(),
    failedLoginAttempts: zod_1.z
        .number()
        .min(0, { message: "failedLoginAttempts cannot be negative" })
        .optional(),
    lockUntil: zod_1.z
        .preprocess((arg) => typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg, zod_1.z.date())
        .optional(),
});
exports.updateUserZodSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        error: "Invalid name format",
    })
        .min(1, { message: "Name cannot be empty" })
        .optional(),
    phone: zod_1.z
        .string({
        error: "Phone number is required",
    })
        .regex(bdPhoneRegex, { message: "Invalid Bangladesh phone number format" })
        .optional(),
    email: zod_1.z.string().email({ message: "Invalid email format" }).optional(),
    picture: zod_1.z.string().url({ message: "Invalid picture URL" }).optional(),
    wallet: objectIdSchema.optional(),
    agentId: objectIdSchema.optional(),
    isVerified: zod_1.z.boolean().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    isSuspended: zod_1.z.boolean().optional(),
    role: zod_1.z.enum(user_interface_1.IRole).optional(),
    failedLoginAttempts: zod_1.z
        .number()
        .min(0, { message: "failedLoginAttempts cannot be negative" })
        .optional(),
    lockUntil: zod_1.z
        .preprocess((arg) => typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg, zod_1.z.date())
        .optional(),
});
exports.verifyOTPZodSchema = zod_1.z.object({
    otp: zod_1.z
        .string({ error: "OTP must be required" })
        .min(6, { error: "OTP length must be 6 numbers" }),
});
