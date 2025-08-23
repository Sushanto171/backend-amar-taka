import z from "zod";

export const resetPasswordZodSchema = z.object({
  otp: z.string({ error: "OTP must be required" }),
  phone: z.string({ error: "Phone must be required" }),
  password: z.string({ error: "Password must be required" }),
});
