import z from "zod";

export const createCourseSectionSchema = z.object({
  courseId: z.string().uuid(),
  termId: z.string().uuid(),
  sectionNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(10)
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Section number may only contain letters, numbers, and hyphens",
    }),
  capacity: z.number().int().min(1).max(1000),
});

export const updateCourseSectionSchema = z.object({
  courseId: z.string().uuid().optional(),
  termId: z.string().uuid().optional(),
  sectionNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1)
    .max(10)
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Section number may only contain letters, numbers, and hyphens",
    })
    .optional(),
  capacity: z.number().int().min(1).max(1000).optional(),
});

export const courseSectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  courseId: z.string().uuid().optional(),
  termId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "sectionNumber",
      "capacity",
      "enrolledCount",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCourseSectionInput = z.infer<
  typeof createCourseSectionSchema
>;
export type UpdateCourseSectionInput = z.infer<
  typeof updateCourseSectionSchema
>;
export type CourseSectionQueryInput = z.infer<typeof courseSectionQuerySchema>;
