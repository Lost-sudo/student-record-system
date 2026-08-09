import { z } from "zod";

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters");
const relationshipSchema = z.string().trim().min(2, "Relationship must be at least 2 characters").max(50, "Relationship must be at most 50 characters");
const phoneSchema = z.string().trim().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits");

export const createEmergencyContactSchema = z.object({
  body: z.object({
    name: nameSchema,
    relationship: relationshipSchema,
    phone: phoneSchema,
    email: z.email("Email must be a valid email address").optional().nullable(),
    isPrimary: z.boolean({ message: "isPrimary must be a boolean" }).optional().default(false),
  }),
});

export const updateEmergencyContactSchema = z.object({
  body: z.object({
    name: nameSchema.optional(),
    relationship: relationshipSchema.optional(),
    phone: phoneSchema.optional(),
    email: z.email("Email must be a valid email address").optional().nullable(),
    isPrimary: z.boolean({ message: "isPrimary must be a boolean" }).optional(),
  }),
});

export type CreateEmergencyContactInput = z.infer<typeof createEmergencyContactSchema>["body"];
export type UpdateEmergencyContactInput = z.infer<typeof updateEmergencyContactSchema>["body"];
