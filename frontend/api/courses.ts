import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./axiosInstance";
import type { ApiError } from "@/types/ApiError";
import type { PaginationMeta } from "./students";

export interface CourseDto {
  id: string;
  courseCode: string;
  title: string;
  description: string | null;
  defaultCredits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoursePrerequisiteDto {
  id: string;
  courseId: string;
  prerequisiteId: string;
  createdAt: string;
}

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CoursesListResponse = ApiResponse<CourseDto[]> & {
  meta: PaginationMeta;
};

export type CoursePrerequisitesListResponse = ApiResponse<CoursePrerequisiteDto[]> & {
  meta: PaginationMeta;
};

export interface CoursePayload {
  courseCode: string;
  title: string;
  description?: string | null;
  defaultCredits: number;
  isActive?: boolean;
}

export type CourseFieldError = {
  field: string;
  message: string;
};

export class CourseMutationError extends Error {
  fieldErrors: CourseFieldError[];

  constructor(message: string, fieldErrors: CourseFieldError[] = []) {
    super(message);
    this.name = "CourseMutationError";
    this.fieldErrors = fieldErrors;
  }
}

const toMutationError = (error: unknown, fallbackMessage: string): never => {
  const axiosError = error as ApiError;
  const data = axiosError.response?.data as
    | { message?: string; errors?: CourseFieldError[] }
    | undefined;

  throw new CourseMutationError(
    data?.message || fallbackMessage,
    (data?.errors ?? []).map(({ field, message }) => ({
      field: field.replace(/^body\./, ""),
      message,
    })),
  );
};

export const useCourses = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["courses", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<CoursesListResponse>("/course", { params });
      return res.data;
    },
  });
};

export const useCoursePrerequisites = () => {
  return useQuery({
    queryKey: ["course-prerequisites", "all"],
    queryFn: async () => {
      const res = await apiClient.get<CoursePrerequisitesListResponse>("/course-prerequisite", {
        params: { limit: 100 },
      });
      return res.data;
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CoursePayload) => {
      const res = await apiClient
        .post<ApiResponse<CourseDto>>("/course", payload)
        .catch((error) => toMutationError(error, "Failed to create course."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CoursePayload> }) => {
      const res = await apiClient
        .patch<ApiResponse<CourseDto>>(`/course/${id}`, payload)
        .catch((error) => toMutationError(error, "Failed to update course."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient
        .delete(`/course/${id}`)
        .catch((error) => toMutationError(error, "Failed to delete course."));
    },
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<CoursesListResponse>({ queryKey: ["courses"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((item) => item.id !== id),
          meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course-prerequisites"] });
    },
  });
};

export const useCreateCoursePrerequisite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, prerequisiteId }: { courseId: string; prerequisiteId: string }) => {
      const res = await apiClient
        .post<ApiResponse<CoursePrerequisiteDto>>("/course-prerequisite", { courseId, prerequisiteId })
        .catch((error) => toMutationError(error, "Failed to add prerequisite."));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-prerequisites"] });
    },
  });
};

export const useDeleteCoursePrerequisite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationId: string) => {
      await apiClient.delete(`/course-prerequisite/${relationId}`).catch((error) =>
        toMutationError(error, "Failed to remove prerequisite."),
      );
    },
    onSuccess: (_result, relationId) => {
      queryClient.setQueriesData<CoursePrerequisitesListResponse>(
        { queryKey: ["course-prerequisites"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((item) => item.id !== relationId),
            meta: { ...old.meta, total: Math.max(0, old.meta.total - 1) },
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["course-prerequisites"] });
    },
  });
};
