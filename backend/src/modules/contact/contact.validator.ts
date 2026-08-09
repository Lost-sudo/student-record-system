import { z } from "zod";

const emailSchema = z.email("Email must be a valid email address");
const phoneSchema = z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits");

export const createContactInformationSchema = z.object({
  body: z.object({
    email: emailSchema,
    phone: phoneSchema.optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

export const updateContactInformationSchema = z.object({
  body: z.object({
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

export type CreateContactInformationInput = z.infer<typeof createContactInformationSchema>["body"];
export type UpdateContactInformationInput = z.infer<typeof updateContactInformationSchema>["body"];
