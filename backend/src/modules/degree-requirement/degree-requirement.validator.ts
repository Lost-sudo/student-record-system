import z from "zod";

export const REQUIREMENT_TYPES = [
  "CORE",
  "ELECTIVE",
  "GENERAL_EDUCATION",
  "MAJOR",
] as const;

export const requirementTypeSchema = z.enum(REQUIREMENT_TYPES);

export const createDegreeRequirementSchema = z.object({
  curriculumId: z.string().uuid(),
  requirementType: requirementTypeSchema,
  minCredits: z.number().int().min(0).default(0),
  courseId: z.string().uuid().nullable().optional(),
});

export const updateDegreeRequirementSchema = z.object({
  requirementType: requirementTypeSchema.optional(),
  minCredits: z.number().int().min(0).optional(),
  courseId: z.string().uuid().nullable().optional(),
});

export const degreeRequirementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  curriculumId: z.string().uuid().optional(),
  requirementType: requirementTypeSchema.optional(),
  courseId: z.string().uuid().optional(),
});

export type CreateDegreeRequirementInput = z.infer<
  typeof createDegreeRequirementSchema
>;
export type UpdateDegreeRequirementInput = z.infer<
  typeof updateDegreeRequirementSchema
>;
export type DegreeRequirementQueryInput = z.infer<
  typeof degreeRequirementQuerySchema
>;
