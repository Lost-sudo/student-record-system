import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export interface CourseSectionDto {
  id: string;
  courseId: string;
  termId: string;
  sectionNumber: string;
  capacity: number;
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CourseSectionsListResponse = ApiResponse<CourseSectionDto[]> & {
  meta: PaginationMeta;
};

export interface CourseSectionPayload {
  courseId: string;
  termId: string;
  sectionNumber: string;
  capacity: number;
}

export type CourseSectionFieldError = {
  field: string;
  message: string;
};

export class CourseSectionMutationError extends Error {
  fieldErrors: CourseSectionFieldError[];

  constructor(message: string, fieldErrors: CourseSectionFieldError[] = []) {
    super(message);
    this.name = "CourseSectionMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: CourseSectionFieldError[] }
    | undefined;

  throw new CourseSectionMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useCourseSections = (params?: {
  page?: number;
  limit?: number;
  courseId?: string;
  termId?: string;
}) => {
  return useQuery({
    queryKey: ["course-sections", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<CourseSectionsListResponse>("/course-section", {
        params,
      });
      return res.data;
    },
  });
};

export const useCreateCourseSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CourseSectionPayload) => {
      const res = await apiClient
        .post<ApiResponse<CourseSectionDto>>("/course-section", payload)
        .catch((error) => toMutationError(error, "Failed to create course section."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-sections"] });
    },
  });
};

export const useUpdateCourseSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CourseSectionPayload>;
    }) => {
      const res = await apiClient
        .patch<ApiResponse<CourseSectionDto>>(`/course-section/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update course section."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-sections"] });
    },
  });
};

export const useDeleteCourseSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient
        .delete(`/course-section/${id}`)
        .catch((error) => toMutationError(error, "Failed to delete course section."));
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<CourseSectionsListResponse>(
        { queryKey: ["course-sections"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== id),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["course-sections"] });
    },
  });
};
