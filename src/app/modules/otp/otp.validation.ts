import z from "zod";

export const sendOTPZodSchema = z.object({
  phone: z.string({ error: "Phone number must be required" }),
});
export const verifyOTPZodSchema = z.object({
  phone: z.string({ error: "Phone number must be required" }),
  otp: z
    .string({ error: "OTP must be required" })
    .min(6, { error: "OTP length must be 6 numbers" }),
});
