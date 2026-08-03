import { z } from 'zod';

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Please select a gender'),
  address: z.string().optional(),
});

export const academicInfoSchema = z.object({
  program: z.string().min(1, 'Please select a program'),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  nationality: z.string().min(1, 'Please select student type'),
  status: z.string(),
  notes: z.string().optional(),
});

export const emergencyContactSchema = z.object({
  ecName: z.string().min(1, 'Contact name is required'),
  ecRelationship: z.string().min(1, 'Relationship is required'),
  ecPhone: z.string().optional(),
  ecEmail: z.string().optional(),
  ecAddress: z.string().optional(),
}).refine(
  (data) => {
    const phoneValid = !!data.ecPhone && data.ecPhone.trim().length >= 6;
    const emailValid = !!data.ecEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ecEmail.trim());
    return phoneValid || emailValid;
  },
  {
    message: 'Provide phone or email',
    path: ['ecPhone'],
  }
);

export const addStudentSchema = personalInfoSchema
  .merge(academicInfoSchema)
  .extend({
    ecName: z.string().min(1, 'Contact name is required'),
    ecRelationship: z.string().min(1, 'Relationship is required'),
    ecPhone: z.string().optional(),
    ecEmail: z.string().optional(),
    ecAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      const phoneValid = !!data.ecPhone && data.ecPhone.trim().length >= 6;
      const emailValid = !!data.ecEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ecEmail.trim());
      return phoneValid || emailValid;
    },
    {
      message: 'Provide phone or email',
      path: ['ecPhone'],
    }
  );

export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type AcademicInfoData = z.infer<typeof academicInfoSchema>;
export type EmergencyContactData = z.infer<typeof emergencyContactSchema>;
export type AddStudentFormData = z.infer<typeof addStudentSchema>;
