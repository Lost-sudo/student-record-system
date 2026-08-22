import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export interface AcademicTermDto {
  id: string;
  termCode: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AcademicTermsListResponse = ApiResponse<AcademicTermDto[]> & {
  meta: PaginationMeta;
};

export interface AcademicTermPayload {
  termCode: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export type AcademicTermFieldError = {
  field: string;
  message: string;
};

export class AcademicTermMutationError extends Error {
  fieldErrors: AcademicTermFieldError[];

  constructor(message: string, fieldErrors: AcademicTermFieldError[] = []) {
    super(message);
    this.name = "AcademicTermMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: AcademicTermFieldError[] }
    | undefined;

  throw new AcademicTermMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useAcademicTerms = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["academic-terms", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<AcademicTermsListResponse>("/academic-term", { params });
      return res.data;
    },
  });
};

export const useCreateAcademicTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AcademicTermPayload) => {
      const res = await apiClient
        .post<ApiResponse<AcademicTermDto>>("/academic-term", payload)
        .catch((error) => toMutationError(error, "Failed to create academic term."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
    },
  });
};

export const useUpdateAcademicTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<AcademicTermPayload> }) => {
      const res = await apiClient
        .patch<ApiResponse<AcademicTermDto>>(`/academic-term/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update academic term."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
    },
  });
};

export const useDeleteAcademicTerm = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/academic-term/${id}`).catch((error) =>
        toMutationError(error, "Failed to delete academic term."),
      );
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<AcademicTermsListResponse>(
        { queryKey: ["academic-terms"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["academic-terms"] });
    },
  });
};
