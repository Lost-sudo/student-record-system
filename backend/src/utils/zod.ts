import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const uuidParamsSchema = z.object({
  id: uuidSchema,
});

export const studentIdParamsSchema = z.object({
  studentId: uuidSchema,
});

export const booleanQuerySchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return value;
}, z.boolean().optional());
