import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { AddStudentFormData } from "@/components/registrar/add-student-schema";
import type { ApiError } from "@/types/ApiError";

export interface StudentDto {
  id: string;
  userId: string | null;
  studentNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: string | null;
  nationality: string | null;
  email: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfoDto {
  id: string;
  studentId: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface EmergencyContactDto {
  id: string;
  studentId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type StudentsListResponse = ApiResponse<StudentDto[]> & { meta: PaginationMeta };

type ApiFieldError = {
  field: string;
  message: string;
};

export class StudentCreationError extends Error {
  stepIndex: number;
  fieldErrors: ApiFieldError[];

  constructor(message: string, stepIndex: number, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = "StudentCreationError";
    this.stepIndex = stepIndex;
    this.fieldErrors = fieldErrors;
  }
}

const clean = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  ) as Partial<T>;

const toCreationError = (error: unknown, stepIndex: number): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as { message?: string; errors?: ApiFieldError[] } | undefined;

  throw new StudentCreationError(
    data?.message || "An unexpected error occurred. Please try again.",
    stepIndex,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export async function createStudentWithDetails(formData: AddStudentFormData) {
  const { studentInfo, contactInfo, emergencyContact } = formData;

  const studentResponse = await apiClient
    .post<ApiResponse<StudentDto>>("/students", clean(studentInfo as Record<string, unknown>))
    .catch((error) => toCreationError(error, 0));
  const student = studentResponse.data.data;

  const contactResponse = await apiClient
    .post<ApiResponse<{ contactInfo: ContactInfoDto }>>(
      `/contactInfo/${student.id}`,
      clean(contactInfo as Record<string, unknown>),
    )
    .catch((error) => toCreationError(error, 1));

  const emergencyResponse = await apiClient
    .post<ApiResponse<{ emergencyContact: EmergencyContactDto }>>(
      `/emergencyContact/${student.id}`,
      {
        ...clean(emergencyContact as Record<string, unknown>),
        isPrimary: emergencyContact.isPrimary ?? false,
      },
    )
    .catch((error) => toCreationError(error, 2));

  return {
    student,
    contactInfo: contactResponse.data.data.contactInfo,
    emergencyContact: emergencyResponse.data.data.emergencyContact,
  };
}

export type CreateStudentResult = Awaited<ReturnType<typeof createStudentWithDetails>>;

export const formatStudentName = (student: StudentDto): string =>
  [student.firstName, student.middleName, student.lastName]
    .filter((part) => part && part.trim())
    .join(" ")
    .replace(/\s+/g, " ");

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudentWithDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useStudents = (params?: { page?: number; limit?: number; searchQuery?: string }) => {
  return useQuery({
    queryKey: ["students", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<StudentsListResponse>("/students", { params });
      return res.data;
    },
  });
};

export const useStudentContactDetails = (studentId: string | null) => {
  return useQuery({
    queryKey: ["student-details", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const [contactRes, emergencyRes] = await Promise.all([
        apiClient.get<ApiResponse<{ contactInfo: ContactInfoDto }>>(`/contactInfo/${studentId}`),
        apiClient.get<ApiResponse<{ emergencyContact: EmergencyContactDto[] }>>(`/emergencyContact/${studentId}`),
      ]);

      return {
        contactInfo: contactRes.data.data.contactInfo ?? null,
        emergencyContact: emergencyRes.data.data.emergencyContact ?? [],
      };
    },
  });
};
