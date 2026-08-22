import { z } from "zod";
import { booleanQuerySchema } from "../../../utils/zod.js";

export const DEGREE_TYPES = [
    'CERTIFICATE',
    'ASSOCIATE',
    'BACHELOR',
    'MASTER',
    'DOCTORATE',
] as const;

export const degreeTypeSchema = z.enum(DEGREE_TYPES);

export const createAcademicProgramSchema = z.object({
    programCode: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9-]+$/, {
      message: 'Program code may only contain letters, numbers, and hyphens',
    }),
    name: z.string().trim().min(3).max(255),
    degreeType: degreeTypeSchema,
    description: z.string().trim().max(2000).nullable().optional(),
    isActive: z.boolean().optional().default(true)
});

export const updateAcademicProgramSchema = z.object({
  programCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9-]+$/, {
      message: 'Program code may only contain letters, numbers, and hyphens',
    })
    .optional(),
  name: z.string().trim().min(3).max(255).optional(),
  degreeType: degreeTypeSchema.optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const academicProgramQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    isActive: booleanQuerySchema,
    degreeType: degreeTypeSchema.optional(),
    sortBy: z.enum(['programCode', 'name', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAcademicProgramInput = z.infer<typeof createAcademicProgramSchema>;
export type UpdateAcademicProgramInput = z.infer<typeof updateAcademicProgramSchema>;
export type AcademicProgramQueryInput = z.infer<typeof academicProgramQuerySchema>;