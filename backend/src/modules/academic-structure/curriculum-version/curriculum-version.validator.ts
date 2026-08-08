import z from "zod";
import { booleanQuerySchema } from "../../../utils/zod";

export const createCurriculumVersionSchema = z.object({
  programId: z.string().uuid(),
  effectiveTermId: z.string().uuid(),
  versionNumber: z.number().int().min(1),
  totalCredits: z.number().int().min(1),
  description: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCurriculumVersionSchema = z.object({
  versionNumber: z.number().int().min(1).optional(),
  totalCredits: z.number().int().min(1).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const curriculumVersionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  programId: z.string().uuid().optional(),
  effectiveTermId: z.string().uuid().optional(),
  isActive: booleanQuerySchema,
  sortBy: z
    .enum(["versionNumber", "totalCredits", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCurriculumVersionInput = z.infer<
  typeof createCurriculumVersionSchema
>;
export type UpdateCurriculumVersionInput = z.infer<
  typeof updateCurriculumVersionSchema
>;
export type CurriculumVersionQueryInput = z.infer<
  typeof curriculumVersionQuerySchema
>;
