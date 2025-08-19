import { z } from "zod";
import { ITransactionType } from "./transaction.interface";
const bdPhoneRegex = /^(?:\+8801|8801|01)[3-9]\d{8}$/;
// Transaction Zod Schema
export const transactionZodSchema = z.object({
  phone: z
    .string({
      error: "Phone number is required",
    })
    .regex(bdPhoneRegex, { message: "Invalid Bangladesh phone number format" }),
  amount: z.preprocess(
    (val) => (typeof val === "string" ? Number(val) : val),
    z.number().positive("Amount must be greater than 0")
  ),

  reference: z.string().optional(),

  type: z.enum([...Object.values(ITransactionType)]),

  bankAccount: z.string().optional(),

  metaData: z.record(z.string(), z.any()).optional(), // flexible metadata
});

export const transactionActionZodSchema = z.object({
  transactionId: z.string({ error: "Transaction id is required!" }),
  password: z.string("Password is required!"),
});
