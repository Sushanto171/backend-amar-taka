import { Types } from "mongoose";
import { z } from "zod";
import { IRole } from "./user.interface";

// Custom validator for ObjectId
const objectIdSchema = z
  .string({
    error: "ObjectId is required",
  })
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });

// Bangladesh phone regex: +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;

export const CreateUserZodSchema = z.object({
  // Required fields
  name: z
    .string({
      error: "Invalid name format",
    })
    .min(1, { message: "Name cannot be empty" }),

  phone: z
    .string({
      error: "Phone number is required",
    })
    .regex(bdPhoneRegex, { message: "Invalid Bangladesh phone number format" }),

  password: z
    .string({
      error: "Password is required",
    })
    .regex(/^\d{6}$/, { message: "Password must be exactly 6 digits." }),

  // Optional fields
  email: z.string().email({ message: "Invalid email format" }).optional(),

  picture: z.string().url({ message: "Invalid picture URL" }).optional(),

  wallet: objectIdSchema.optional(),

  agentId: objectIdSchema.optional(),

  isVerified: z.boolean().optional(),

  isDeleted: z.boolean().optional(),

  isSuspended: z.boolean().optional(),

  role: z.enum(IRole).optional(),

  failedLoginAttempts: z
    .number()
    .min(0, { message: "failedLoginAttempts cannot be negative" })
    .optional(),

  lockUntil: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
      z.date()
    )
    .optional(),
});
