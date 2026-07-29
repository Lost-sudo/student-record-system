import { z } from "zod";

export const createEmergencyContactSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
        relationship: z.string().min(2, "Relationship must be at least 2 characters").max(50, "Relationship must be at most 50 characters"),
        phone: z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits"),
        email: z.email("Email must be a valid email address").optional().nullable(),
        isPrimary: z.boolean({ message: "isPrimary must be a boolean" }),
    }),
})

export const updateEmergencyContactSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
        relationship: z.string().min(2, "Relationship must be at least 2 characters").max(50, "Relationship must be at most 50 characters").optional(),
        phone: z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits").optional(),
        email: z.email("Email must be a valid email address").optional().nullable(),
        isPrimary: z.boolean({ message: "isPrimary must be a boolean" }).optional(),
    }),
})