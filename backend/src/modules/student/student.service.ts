import { Student } from "../../generated/prisma/client";
import { AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../utils/error.utils";
import { isPrismaRecordNotFound, isUniqueConstraintViolation } from "../../utils/prisma-error.utils";
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
        throw new ConflictError("This user account is already linked to another student");
      }
    }

    let newStudent: Student;
    try {
      newStudent = await this.studentRepository.createWithGeneratedNumber(input, userId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("This user account is already linked to another student");
      }
      throw new InternalServerError("Failed to create student");
    }
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
      throw new NotFoundError("Student not found");
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
        throw new ConflictError("Student number is already taken by another student");
      }
    }

    if (input.userId) {
      const duplicateUserId = await this.studentRepository.findDuplicateUserId(input.userId, studentId);
      if (duplicateUserId) {
        throw new ConflictError("This user account is already linked to another student");
      }
    }

    let updated: Student;
    try {
      updated = await this.studentRepository.update(studentId, input);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("Student number is already taken by another student");
      }
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Student not found");
      }
      throw new InternalServerError("Failed to update student");
    }
    return this.toDto(updated);
  }

  async updateStudent(studentId: string, input: UpdateStudentInput): Promise<StudentDto> {
    return this.update(studentId, input);
  }

  async delete(studentId: string): Promise<StudentDto> {
    const existingStudent = await this.studentRepository.findExistingById(studentId);

    if (!existingStudent) {
      throw new NotFoundError("Student not found");
    }

    if (existingStudent.deletedAt !== null) {
      throw new BadRequestError("Student already deleted");
    }

    let deleted: Student;
    try {
      deleted = await this.studentRepository.delete(studentId);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Student not found");
      }
      throw new InternalServerError("Failed to delete student");
    }
    return this.toDto(deleted);
  }

  async softDeleteStudent(studentId: string): Promise<StudentDto> {
    return this.delete(studentId);
  }

  private toDto(model: Student & { contactInfo?: { email: string | null } | null }): StudentDto {
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
      email: model.contactInfo?.email ?? null,
      deletedAt: model.deletedAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
