import { z } from "zod";
import { IAgentStatus, IKYCStatus } from "./agent.interface";

export const nidPhotoTypeSchema = z
  .object({
    frontend: z.string().url().optional(),
    backend: z.string().url().optional(),
  })
  .refine((v) => !!(v.frontend || v.backend), {
    message: "At least one of front/back NID photo URL is required",
  });

export const agentCoreZodSchema = z.object({
  agentCode: z
    .string({ error: "agentCode is required" })
    .trim()
    .regex(/^AGT-\d{4}\s?\d{3,}$/i, {
      message: "agentCode format invalid (e.g., AGT-2025001 or AGT-2025 001)",
    }),

  licenseNumber: z
    .string({ error: "licenseNumber is required" })
    .trim()
    .min(3, "licenseNumber seems too short"),

  nidNumber: z
    .string({ error: "nidNumber is required" })
    .trim()
    .regex(/^(?:\d{10}|\d{13}|\d{17})$/, {
      message: "nidNumber must be 10, 13, or 17 digits",
    }),

  nidPhotoUrl: nidPhotoTypeSchema.optional(),

  serviceAreas: z
    .array(
      z
        .string({ error: "service area is required" })
        .trim()
        .min(1, "service area cannot be empty")
    )
    .min(1, "at least one service area is required"),
});

export const agentUpdateZodSchema = z.object({
  nidPhotoUrl: nidPhotoTypeSchema.optional(),
  status: z.enum(Object.values(IAgentStatus)).optional(),
  serviceAreas: z
    .array(
      z
        .string({ error: "service area is required" })
        .trim()
        .min(1, "service area cannot be empty")
    )
    .min(1, "at least one service area is required")
    .optional(),
});

export const agentStatusZodSchema = z.object({
  kycStatus: z.enum(Object.values(IKYCStatus)),
});
