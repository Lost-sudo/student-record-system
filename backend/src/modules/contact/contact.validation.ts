import {z} from "zod";

export const createContactInformationSchema = z.object({
    body: z.object({
        email: z.email("Email must be a valid email address"),
        phone: z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits").optional(),
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
        email: z.email("Email must be a valid email address").optional(),
        phone: z.string().min(7, "Phone number must be at least 7 digits").max(20, "Phone number must be at most 20 digits").optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
    }),
});