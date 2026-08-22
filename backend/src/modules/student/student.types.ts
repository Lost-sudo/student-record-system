import { Student as PrismaStudent } from "../../generated/prisma/client.js";
import { StudentQueryInput, CreateStudentInput, UpdateStudentInput } from "./student.validator.js";

export type StudentDto = {
  id: PrismaStudent["id"];
  userId: PrismaStudent["userId"];
  studentNumber: PrismaStudent["studentNumber"];
  firstName: PrismaStudent["firstName"];
  middleName: PrismaStudent["middleName"];
  lastName: PrismaStudent["lastName"];
  dateOfBirth: PrismaStudent["dateOfBirth"];
  gender: PrismaStudent["gender"];
  nationality: PrismaStudent["nationality"];
  email: string | null;
  deletedAt: PrismaStudent["deletedAt"];
  createdAt: PrismaStudent["createdAt"];
  updatedAt: PrismaStudent["updatedAt"];
};

export type PaginatedStudentResponse = {
  items: StudentDto[];
  total: number;
  page: number;
  totalPages: number;
};

export type {
  StudentQueryInput,
  CreateStudentInput,
  UpdateStudentInput,
};
