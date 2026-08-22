import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export interface CurriculumVersionDto {
  id: string;
  programId: string;
  effectiveTermId: string;
  totalCredits: number;
  description: string | null;
  versionNumber: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CurriculumVersionsListResponse = ApiResponse<CurriculumVersionDto[]> & {
  meta: PaginationMeta;
};

export interface CurriculumVersionPayload {
  programId: string;
  effectiveTermId: string;
  versionNumber: number;
  totalCredits: number;
  description?: string | null;
  isActive?: boolean;
}

export type CurriculumVersionFieldError = {
  field: string;
  message: string;
};

export class CurriculumVersionMutationError extends Error {
  fieldErrors: CurriculumVersionFieldError[];

  constructor(message: string, fieldErrors: CurriculumVersionFieldError[] = []) {
    super(message);
    this.name = "CurriculumVersionMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: CurriculumVersionFieldError[] }
    | undefined;

  throw new CurriculumVersionMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useCurriculumVersions = (params?: {
  page?: number;
  limit?: number;
  programId?: string;
  effectiveTermId?: string;
}) => {
  return useQuery({
    queryKey: ["curriculum-versions", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<CurriculumVersionsListResponse>("/curriculum-version", {
        params,
      });
      return res.data;
    },
  });
};

export const useCreateCurriculumVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CurriculumVersionPayload) => {
      const res = await apiClient
        .post<ApiResponse<CurriculumVersionDto>>("/curriculum-version", payload)
        .catch((error) => toMutationError(error, "Failed to create curriculum version."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-versions"] });
    },
  });
};

export const useUpdateCurriculumVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<CurriculumVersionPayload, "programId" | "effectiveTermId">>;
    }) => {
      const res = await apiClient
        .patch<ApiResponse<CurriculumVersionDto>>(`/curriculum-version/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update curriculum version."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculum-versions"] });
    },
  });
};

export const useDeleteCurriculumVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient
        .delete(`/curriculum-version/${id}`)
        .catch((error) => toMutationError(error, "Failed to delete curriculum version."));
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<CurriculumVersionsListResponse>(
        { queryKey: ["curriculum-versions"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["curriculum-versions"] });
      queryClient.invalidateQueries({ queryKey: ["degree-requirements"] });
    },
  });
};
