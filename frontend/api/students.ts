import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type {
  AddStudentFormData,
  StudentInfoData,
  ContactInfoData,
  EmergencyContactData,
} from "@/components/registrar/add-student-schema";
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

export type StudentsListResponse = ApiResponse<StudentDto[]> & { meta: PaginationMeta };

export interface StudentGenderCountDto {
  gender: string | null;
  count: number;
}

export interface StudentNationalityCountDto {
  nationality: string | null;
  count: number;
}

export interface StudentStatsDto {
  totalActiveStudents: number;
  newStudentsThisWeek: number;
  newStudentsThisMonth: number;
  newStudentsLastMonth: number;
  totalArchivedStudents: number;
  genderDistribution: StudentGenderCountDto[];
  nationalityDistribution: StudentNationalityCountDto[];
}

export type StudentsStatsResponse = ApiResponse<StudentStatsDto>;

export type StudentDetailsData = {
  contactInfo: ContactInfoDto | null;
  emergencyContact: EmergencyContactDto[];
};

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

export interface UpdateStudentPayload {
  studentInfo?: StudentInfoData;
  contactInfo?: ContactInfoData & { contactInfoExisted?: boolean };
  emergencyContact?: EmergencyContactData & { existingEmergencyContactId?: string | null };
}

export type UpdateStudentResult = {
  student?: StudentDto;
  contactInfo?: ContactInfoDto;
  emergencyContact?: EmergencyContactDto;
};

export async function updateStudentWithDetails(
  studentId: string,
  sections: UpdateStudentPayload,
): Promise<UpdateStudentResult> {
  const { studentInfo, contactInfo, emergencyContact } = sections;
  const result: UpdateStudentResult = {};

  if (studentInfo) {
    const studentResponse = await apiClient
      .patch<ApiResponse<StudentDto>>(`/students/${studentId}`, clean(studentInfo as Record<string, unknown>))
      .catch((error) => toCreationError(error, 0));
    result.student = studentResponse.data.data;
  }

  if (contactInfo) {
    const { contactInfoExisted, ...contactData } = contactInfo;
    const contactPayload = clean(contactData as Record<string, unknown>);
    const contactResponse = contactInfoExisted
      ? await apiClient
          .patch<ApiResponse<{ contactInfo: ContactInfoDto }>>(
            `/contactInfo/${studentId}`,
            contactPayload,
          )
          .catch((error) => toCreationError(error, 1))
      : await apiClient
          .post<ApiResponse<{ contactInfo: ContactInfoDto }>>(
            `/contactInfo/${studentId}`,
            contactPayload,
          )
          .catch((error) => toCreationError(error, 1));
    result.contactInfo = contactResponse.data.data.contactInfo;
  }

  if (emergencyContact) {
    const { existingEmergencyContactId, ...emergencyData } = emergencyContact;
    const payload = {
      ...clean(emergencyData as Record<string, unknown>),
      isPrimary: emergencyData.isPrimary ?? false,
    };

    const emergencyResponse = existingEmergencyContactId
      ? await apiClient
          .patch<ApiResponse<{ emergencyContact: EmergencyContactDto }>>(
            `/emergencyContact/${existingEmergencyContactId}`,
            payload,
          )
          .catch((error) => toCreationError(error, 2))
      : await apiClient
          .post<ApiResponse<{ emergencyContact: EmergencyContactDto }>>(
            `/emergencyContact/${studentId}`,
            payload,
          )
          .catch((error) => toCreationError(error, 2));

    result.emergencyContact = emergencyResponse.data.data.emergencyContact;
  }

  return result;
}

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

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, sections }: { studentId: string; sections: UpdateStudentPayload }) =>
      updateStudentWithDetails(studentId, sections),
    onSuccess: (result, variables) => {
      const { studentId } = variables;

      queryClient.setQueryData<StudentDetailsData>(["student-details", studentId], (old) => {
        if (!old) return old;
        return {
          contactInfo: result.contactInfo ?? old.contactInfo,
          emergencyContact: result.emergencyContact
            ? mergeEmergencyContact(old.emergencyContact, result.emergencyContact)
            : old.emergencyContact,
        };
      });

      queryClient.setQueriesData<StudentsListResponse>({ queryKey: ["students"] }, (old) => {
        if (!old || (!result.student && !result.contactInfo)) return old;
        return {
          ...old,
          data: old.data.map((item) => {
            if (item.id !== studentId) return item;
            return {
              ...item,
              ...(result.student ?? {}),
              email: result.contactInfo?.email ?? item.email,
            };
          }),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student-details", studentId] });
    },
  });
};

const mergeEmergencyContact = (
  current: EmergencyContactDto[],
  updated: EmergencyContactDto,
): EmergencyContactDto[] => {
  const exists = current.some((contact) => contact.id === updated.id);
  if (exists) {
    return current.map((contact) => (contact.id === updated.id ? updated : contact));
  }
  return [updated, ...current];
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => apiClient.delete(`/students/${studentId}`),
    onSuccess: (_result, studentId) => {
      queryClient.setQueriesData<StudentsListResponse>({ queryKey: ["students"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((item) => item.id !== studentId),
          meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        };
      });
      queryClient.removeQueries({ queryKey: ["student-details", studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const toDateInputValue = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const areSectionsEqual = (
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean => {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
  return keys.every((key) => String(a[key] ?? "").trim() === String(b[key] ?? "").trim());
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

export const useArchivedStudents = (params?: { page?: number; limit?: number; searchQuery?: string }) => {
  return useQuery({
    queryKey: ["archived-students", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<StudentsListResponse>("/students/archived", { params });
      return res.data;
    },
  });
};

export const useStudentStats = () => {
  return useQuery({
    queryKey: ["students", "stats"],
    queryFn: async () => {
      const res = await apiClient.get<StudentsStatsResponse>("/students/stats");
      return res.data.data;
    },
  });
};

export const monthOverMonthChange = (current: number, previous: number): number | null => {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
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
