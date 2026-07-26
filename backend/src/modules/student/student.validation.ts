import { z } from "zod";

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(3, "Student firstname must be atleast 3 characters"),
    middleName: z
      .string()
      .min(3, "Student middlename must be atleast 3 characters")
      .optional(),
    lastName: z
      .string()
      .min(3, "Student lastname must be atleast 3 characters"),
    dateOfBirth: z.date("Student date of birth must be a date object"),
    gender: z.string().optional(),
    nationality: z.string().optional(),
  }),
});
