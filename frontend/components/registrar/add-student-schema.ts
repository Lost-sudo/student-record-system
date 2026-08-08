import { z } from 'zod';

export const studentInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  nationality: z.string().optional(),
});

export const contactInfoSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || value.trim().length >= 7, {
      message: 'Phone number must be at least 7 digits',
    }),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(2, 'Contact name must be at least 2 characters'),
  relationship: z.string().trim().min(2, 'Relationship must be at least 2 characters'),
  phone: z.string().trim().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const addStudentSchema = z.object({
  studentInfo: studentInfoSchema,
  contactInfo: contactInfoSchema,
  emergencyContact: emergencyContactSchema,
});

export type StudentInfoData = z.infer<typeof studentInfoSchema>;
export type ContactInfoData = z.infer<typeof contactInfoSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type AddStudentFormData = z.infer<typeof addStudentSchema>;
