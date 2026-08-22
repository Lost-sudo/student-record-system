import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export const DEGREE_TYPES = [
  "CERTIFICATE",
  "ASSOCIATE",
  "BACHELOR",
  "MASTER",
  "DOCTORATE",
] as const;

export type DegreeType = (typeof DEGREE_TYPES)[number];

export interface AcademicProgramDto {
  id: string;
  programCode: string;
  name: string;
  degreeType: DegreeType;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AcademicProgramsListResponse = ApiResponse<AcademicProgramDto[]> & {
  meta: PaginationMeta;
};

export interface AcademicProgramPayload {
  programCode: string;
  name: string;
  degreeType: DegreeType;
  description?: string | null;
  isActive?: boolean;
}

export type AcademicProgramFieldError = {
  field: string;
  message: string;
};

export class AcademicProgramMutationError extends Error {
  fieldErrors: AcademicProgramFieldError[];

  constructor(message: string, fieldErrors: AcademicProgramFieldError[] = []) {
    super(message);
    this.name = "AcademicProgramMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: AcademicProgramFieldError[] }
    | undefined;

  throw new AcademicProgramMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useAcademicPrograms = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  degreeType?: DegreeType;
}) => {
  return useQuery({
    queryKey: ["programs", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<AcademicProgramsListResponse>("/academic-program", {
        params,
      });
      return res.data;
    },
  });
};

export const useCreateAcademicProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AcademicProgramPayload) => {
      const res = await apiClient
        .post<ApiResponse<AcademicProgramDto>>("/academic-program", payload)
        .catch((error) => toMutationError(error, "Failed to create academic program."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useUpdateAcademicProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AcademicProgramPayload>;
    }) => {
      const res = await apiClient
        .patch<ApiResponse<AcademicProgramDto>>(`/academic-program/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update academic program."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};

export const useDeleteAcademicProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient
        .delete(`/academic-program/${id}`)
        .catch((error) => toMutationError(error, "Failed to delete academic program."));
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<AcademicProgramsListResponse>(
        { queryKey: ["programs"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
  });
};
