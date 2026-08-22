import { z } from "zod";
import { uuidSchema } from "../../utils/zod.js";

const nameSchema = z.string().trim().min(2).max(100);

export const createStudentSchema = z.object({
  firstName: nameSchema,
  middleName: nameSchema.optional(),
  lastName: nameSchema,
  dateOfBirth: z.coerce.date({ message: "Student date of birth must be a valid date (ISO 8601 format)" }),
  gender: z.string().trim().max(50).optional(),
  nationality: z.string().trim().max(100).optional(),
  userId: uuidSchema.optional(),
});

export const updateStudentSchema = z.object({
  firstName: nameSchema.optional(),
  middleName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  dateOfBirth: z.coerce.date({ message: "Student date of birth must be a valid date (ISO 8601 format)" }).optional(),
  gender: z.string().trim().max(50).optional(),
  nationality: z.string().trim().max(100).optional(),
  userId: uuidSchema.optional(),
  studentNumber: z.string().trim().min(1).max(50).optional(),
});

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  searchQuery: z.string().trim().optional(),
});

export const studentParamsSchema = z.object({
  id: uuidSchema,
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
export type StudentParamsInput = z.infer<typeof studentParamsSchema>;
