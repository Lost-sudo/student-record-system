import { z } from "zod";

export const createCoursePrerequisiteSchema = z.object({
    courseId: z.string().uuid(),
    prerequisiteId: z.string().uuid(),
});

export const coursePrerequisiteQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    courseId: z.string().uuid().optional(),
    prerequisiteId: z.string().uuid().optional(),
});

export type CreateCoursePrerequisiteInput = z.infer<typeof createCoursePrerequisiteSchema>
export type CoursePrerequisiteQueryInput = z.infer<typeof coursePrerequisiteQuerySchema>;