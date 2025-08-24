"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentStatusZodSchema = exports.agentUpdateZodSchema = exports.agentCoreZodSchema = exports.nidPhotoTypeSchema = void 0;
const zod_1 = require("zod");
const agent_interface_1 = require("./agent.interface");
exports.nidPhotoTypeSchema = zod_1.z
    .object({
    frontend: zod_1.z.string().url().optional(),
    backend: zod_1.z.string().url().optional(),
})
    .refine((v) => !!(v.frontend || v.backend), {
    message: "At least one of front/back NID photo URL is required",
});
exports.agentCoreZodSchema = zod_1.z.object({
    agentCode: zod_1.z
        .string({ error: "agentCode is required" })
        .trim()
        .regex(/^AGT-\d{4}\s?\d{3,}$/i, {
        message: "agentCode format invalid (e.g., AGT-2025001 or AGT-2025 001)",
    }),
    licenseNumber: zod_1.z
        .string({ error: "licenseNumber is required" })
        .trim()
        .min(3, "licenseNumber seems too short"),
    nidNumber: zod_1.z
        .string({ error: "nidNumber is required" })
        .trim()
        .regex(/^(?:\d{10}|\d{13}|\d{17})$/, {
        message: "nidNumber must be 10, 13, or 17 digits",
    }),
    nidPhotoUrl: exports.nidPhotoTypeSchema.optional(),
    serviceAreas: zod_1.z
        .array(zod_1.z
        .string({ error: "service area is required" })
        .trim()
        .min(1, "service area cannot be empty"))
        .min(1, "at least one service area is required"),
});
exports.agentUpdateZodSchema = zod_1.z.object({
    nidPhotoUrl: exports.nidPhotoTypeSchema.optional(),
    status: zod_1.z.enum(Object.values(agent_interface_1.IAgentStatus)).optional(),
    serviceAreas: zod_1.z
        .array(zod_1.z
        .string({ error: "service area is required" })
        .trim()
        .min(1, "service area cannot be empty"))
        .min(1, "at least one service area is required")
        .optional(),
});
exports.agentStatusZodSchema = zod_1.z.object({
    kycStatus: zod_1.z.enum(Object.values(agent_interface_1.IKYCStatus)),
});
