import { Student, Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { CreateStudentInput, StudentQueryInput, UpdateStudentInput } from "./student.validator.js";

export class StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findLinkedStudentByUserId(userId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: { userId, deletedAt: null },
    });
  }

  async findLatestStudentNumber(prefix: string): Promise<Pick<Student, "studentNumber"> | null> {
    return this.prisma.student.findFirst({
      where: {
        studentNumber: { startsWith: prefix },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: { studentNumber: true },
    });
  }

  async create(data: CreateStudentInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async createWithGeneratedNumber(
    data: CreateStudentInput,
    userId?: string,
  ): Promise<Student> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const prefix = "STU";
      const currentYear = new Date().getFullYear();
      const searchPrefix = `${prefix}-${currentYear}-`;

      const latestStudent = await tx.student.findFirst({
        where: {
          studentNumber: { startsWith: searchPrefix },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: { studentNumber: true },
      });

      let nextSequence = 1;
      if (latestStudent?.studentNumber) {
        const parts = latestStudent.studentNumber.split("-");
        const lastNumber = parseInt(parts[2], 10);
        nextSequence = lastNumber + 1;
      }

      const generatedStudentNumber = `${searchPrefix}${String(nextSequence).padStart(4, "0")}`;

      return tx.student.create({
        data: {
          ...data,
          studentNumber: generatedStudentNumber,
          userId: userId || undefined,
        },
      });
    });
  }

  async findArchived(params: StudentQueryInput): Promise<{ items: Student[]; total: number }> {
    const where: Prisma.StudentWhereInput = { deletedAt: { not: null } };

    if (params.searchQuery) {
      where.OR = [
        { firstName: { contains: params.searchQuery, mode: "insensitive" } },
        { lastName: { contains: params.searchQuery, mode: "insensitive" } },
        { studentNumber: { contains: params.searchQuery, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { deletedAt: "desc" },
        include: {
          contactInfo: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total };
  }

  async findMany(params: StudentQueryInput): Promise<{ items: Student[]; total: number }> {
    const where: Prisma.StudentWhereInput = { deletedAt: null };

    if (params.searchQuery) {
      where.OR = [
        { firstName: { contains: params.searchQuery, mode: "insensitive" } },
        { lastName: { contains: params.searchQuery, mode: "insensitive" } },
        { studentNumber: { contains: params.searchQuery, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          contactInfo: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        emergencyContacts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async update(id: string, data: UpdateStudentInput): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async findDuplicateStudentNumber(studentNumber: string, studentId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        studentNumber,
        id: { not: studentId },
        deletedAt: null,
      },
    });
  }

  async findDuplicateUserId(userId: string, studentId: string): Promise<Student | null> {
    return this.prisma.student.findFirst({
      where: {
        userId,
        id: { not: studentId },
        deletedAt: null,
      },
    });
  }

  async findExistingById(id: string): Promise<Student | null> {
    return this.prisma.student.findUnique({ where: { id } });
  }
}
