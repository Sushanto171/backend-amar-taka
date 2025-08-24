import z from "zod";

export const walletActionZodSchema = z.object({
  walletId: z.string({ error: "walletId must be required" }),
  isBlock: z.boolean({ error: "isBlock must be required" }),
});

export type WalletAction = z.infer<typeof walletActionZodSchema>;
