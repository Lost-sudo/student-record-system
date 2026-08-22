import { date, z } from "zod";
import { booleanQuerySchema } from '../../../utils/zod.js';

export const createAcademicTermSchema = z.object({
    termCode: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9-]+$/, {
        message: 'Term code may only contain letters, numbers, and hyphens',
    }),
    name: z.string().trim().min(3).max(255),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isActive: z.boolean().optional().default(true),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
});

export const updateAcademicTermSchema = z.object({
    termCode: z.string().trim().toUpperCase().min(2).max(20).regex(/^[A-Z0-9-]+$/, {
        message: 'Term code may only contain letters, numbers, and hyphens',
    }).optional(),
    name: z.string().trim().min(3).max(255).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
}).refine((data) => {
        if (!data.startDate || !data.endDate) return true;
        return data.endDate > data.startDate;
    },{
        message: 'End date must be after start date',
        path: ['endDate'],
    }
);

export const academicTermQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().optional(),
    isActive: booleanQuerySchema,
    sortBy: z.enum(['termCode', 'name', 'startDate', 'endDate', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAcademicTermInput = z.infer<typeof createAcademicTermSchema>;
export type UpdateAcademicTermInput = z.infer<typeof updateAcademicTermSchema>;
export type AcademicTermQueryInput = z.infer<typeof academicTermQuerySchema>;
