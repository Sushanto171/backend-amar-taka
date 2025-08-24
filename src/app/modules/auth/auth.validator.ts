import z from "zod";

export const resetPasswordZodSchema = z.object({
  otp: z.string({ error: "OTP must be required" }),
  phone: z.string({ error: "Phone must be required" }),
  password: z.string({ error: "Password must be required" }),
});

export const verifyPwChangeOTPZodSchema = z.object({
  otp: z.string({ error: "OTP must be required" }),
});

export const changePwZodSchema = z.object({
  newPassword: z.string({ error: "New Password must be required" }),
  oldPassword: z.string({ error: "Old Password must be required" }),
});
