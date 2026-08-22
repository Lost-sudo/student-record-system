import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export const REQUIREMENT_TYPES = [
  "CORE",
  "ELECTIVE",
  "GENERAL_EDUCATION",
  "MAJOR",
] as const;

export type RequirementType = (typeof REQUIREMENT_TYPES)[number];

export interface DegreeRequirementDto {
  id: string;
  curriculumId: string;
  requirementType: RequirementType;
  minCredits: number;
  courseId: string | null;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type DegreeRequirementsListResponse = ApiResponse<DegreeRequirementDto[]> & {
  meta: PaginationMeta;
};

export interface DegreeRequirementPayload {
  curriculumId: string;
  requirementType: RequirementType;
  minCredits: number;
  courseId?: string | null;
}

export type DegreeRequirementFieldError = {
  field: string;
  message: string;
};

export class DegreeRequirementMutationError extends Error {
  fieldErrors: DegreeRequirementFieldError[];

  constructor(message: string, fieldErrors: DegreeRequirementFieldError[] = []) {
    super(message);
    this.name = "DegreeRequirementMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: DegreeRequirementFieldError[] }
    | undefined;

  throw new DegreeRequirementMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useDegreeRequirements = (params?: {
  page?: number;
  limit?: number;
  curriculumId?: string;
  courseId?: string;
}) => {
  return useQuery({
    queryKey: ["degree-requirements", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<DegreeRequirementsListResponse>("/degree-requirement", {
        params,
      });
      return res.data;
    },
  });
};

export const useCreateDegreeRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DegreeRequirementPayload) => {
      const res = await apiClient
        .post<ApiResponse<DegreeRequirementDto>>("/degree-requirement", payload)
        .catch((error) => toMutationError(error, "Failed to add requirement."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree-requirements"] });
    },
  });
};

export const useUpdateDegreeRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<DegreeRequirementPayload, "curriculumId">>;
    }) => {
      const res = await apiClient
        .put<ApiResponse<DegreeRequirementDto>>(`/degree-requirement/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update requirement."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["degree-requirements"] });
    },
  });
};

export const useDeleteDegreeRequirement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient
        .delete(`/degree-requirement/${id}`)
        .catch((error) => toMutationError(error, "Failed to remove requirement."));
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<DegreeRequirementsListResponse>(
        { queryKey: ["degree-requirements"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["degree-requirements"] });
    },
  });
};
