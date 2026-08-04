import { Student } from "../../generated/prisma/client";
import { AppError } from "../../middlewares/error.middleware";
import { buildPaginationMeta, PaginationMeta } from "../../utils/pagination";
import { CreateStudentInput, StudentQueryInput, UpdateStudentInput } from "./student.validator";
import { StudentDto } from "./student.types";
import { StudentRepository } from "./student.repository";

export class StudentService {
  constructor(private readonly studentRepository: StudentRepository) {}

  private normalizePagination(query: Partial<StudentQueryInput>): StudentQueryInput {
    const page = Number.isInteger(query.page) && query.page && query.page > 0 ? query.page : 1;
    const limit = Number.isInteger(query.limit) && query.limit && query.limit > 0 ? query.limit : 20;

    return {
      page,
      limit,
      searchQuery: query.searchQuery,
    };
  }

  async create(input: CreateStudentInput, userId?: string): Promise<StudentDto> {
    if (userId) {
      const existingUserLink = await this.studentRepository.findLinkedStudentByUserId(userId);
      if (existingUserLink) {
        throw new AppError("This user account is already linked to another student", 409);
      }
    }

    const newStudent = await this.studentRepository.createWithGeneratedNumber(input, userId);
    return this.toDto(newStudent);
  }

  async createStudent(input: CreateStudentInput, userId?: string): Promise<StudentDto> {
    return this.create(input, userId);
  }

  async list(query: StudentQueryInput): Promise<{ items: StudentDto[]; meta: PaginationMeta }> {
    const { items, total } = await this.studentRepository.findMany(query);
    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getStudents(
    query: Partial<StudentQueryInput>,
  ): Promise<{ data: StudentDto[]; total: number; page: number; totalPages: number }> {
    const normalizedQuery = this.normalizePagination(query);
    const result = await this.list(normalizedQuery);
    return {
      data: result.items,
      total: result.meta.total,
      page: result.meta.page,
      totalPages: result.meta.totalPages,
    };
  }

  async getById(studentId: string): Promise<StudentDto> {
    const student = await this.studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    return this.toDto(student);
  }

  async getStudentById(studentId: string): Promise<StudentDto> {
    return this.getById(studentId);
  }

  async update(studentId: string, input: UpdateStudentInput): Promise<StudentDto> {
    await this.getById(studentId);

    if (input.studentNumber) {
      const duplicateStudentNumber = await this.studentRepository.findDuplicateStudentNumber(input.studentNumber, studentId);
      if (duplicateStudentNumber) {
        throw new AppError("Student number is already taken by another student", 409);
      }
    }

    if (input.userId) {
      const duplicateUserId = await this.studentRepository.findDuplicateUserId(input.userId, studentId);
      if (duplicateUserId) {
        throw new AppError("This user account is already linked to another student", 409);
      }
    }

    const updated = await this.studentRepository.update(studentId, input);
    return this.toDto(updated);
  }

  async updateStudent(studentId: string, input: UpdateStudentInput): Promise<StudentDto> {
    return this.update(studentId, input);
  }

  async delete(studentId: string): Promise<StudentDto> {
    const existingStudent = await this.studentRepository.findExistingById(studentId);

    if (!existingStudent) {
      throw new AppError("Student not found", 404);
    }

    if (existingStudent.deletedAt !== null) {
      throw new AppError("Student already deleted", 400);
    }

    const deleted = await this.studentRepository.delete(studentId);
    return this.toDto(deleted);
  }

  async softDeleteStudent(studentId: string): Promise<StudentDto> {
    return this.delete(studentId);
  }

  private toDto(model: Student): StudentDto {
    return {
      id: model.id,
      userId: model.userId,
      studentNumber: model.studentNumber,
      firstName: model.firstName,
      middleName: model.middleName,
      lastName: model.lastName,
      dateOfBirth: model.dateOfBirth,
      gender: model.gender,
      nationality: model.nationality,
      deletedAt: model.deletedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
