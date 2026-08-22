import { z } from "zod";
import { booleanQuerySchema } from "../../../utils/zod.js";

export const createCourseSchema = z.object({
    courseCode: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9-]+$/, {
        message: 'Course code may only contain letters, numbers, and hyphens',
    }),
    title: z.string().trim().min(3).max(255),
    description: z.string().trim().max(3000).nullable().optional(),
    defaultCredits: z.number().int().min(1).max(12),
    isActive: z.boolean().optional().default(true),
});

export const updateCourseSchema = z.object({
    courseCode: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9-]+$/, {
        message: 'Course code may only contain letters, numbers, and hyphens',
    }).optional(),
    title: z.string().trim().min(3).max(255).optional(),
    description: z.string().trim().max(3000).nullable().optional(),
    defaultCredits: z.number().int().min(1).max(12).optional(),
    isActive: z.boolean().optional(),
});

export const courseQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    isActive: booleanQuerySchema,
    sortBy: z.enum(['courseCode', 'title', 'defaultCredits', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['desc', 'asc']).default('desc'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;