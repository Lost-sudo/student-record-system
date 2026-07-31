import { z } from "zod";

const nameSchema = z.string().min(2, "Must be at least 2 characters").max(100, "Must be at most 100 characters");

export const createStudentSchema = z.object({
  body: z.object({
    firstName: nameSchema,
    middleName: nameSchema.optional(),
    lastName: nameSchema,
    dateOfBirth: z.coerce.date({ message: "Student date of birth must be a valid date (ISO 8601 format)" }),
    gender: z.string().optional(),
    nationality: z.string().optional(),
    userId: z.string().uuid().optional(),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    firstName: nameSchema.optional(),
    middleName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    dateOfBirth: z.coerce.date({ message: "Student date of birth must be a valid date (ISO 8601 format)" }).optional(),
    gender: z.string().optional(),
    nationality: z.string().optional(),
  }),
});
