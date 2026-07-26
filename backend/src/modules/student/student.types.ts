import { Student } from "../../generated/prisma/client";

export type GetStudentParams = {
  page?: number;
  limit?: number;
  searchQuery?: string;
};

export type PaginatedStudentResponse = {
  data: Student[];
  total: number;
  page: number;
  totalPages: number;
};
