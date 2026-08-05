import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        email: z.email("Invalid email format"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(['SUPER_ADMIN', 'REGISTRAR', 'DEPARTMENT_CHAIR', 'FACULTY', 'STUDENT']).optional().default('STUDENT'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email format"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});