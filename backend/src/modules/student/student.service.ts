import { prisma } from "../../database/prisma";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../middlewares/error.middleware";
import { GetStudentParams, PaginatedStudentResponse } from "./student.types";

export class StudentService {
  async createStudent(
    data: Prisma.StudentUncheckedCreateInput,
    userId?: string,
  ) {
    if (userId) {
      const existingUserLink = await prisma.student.findFirst({
        where: { userId: userId, deletedAt: null },
      });

      if (existingUserLink) {
        throw new AppError(
          "This user account is already linked to another student",
          409,
        );
      }
    }

    const newStudent = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const prefix = "STU";
        const currentYear = new Date().getFullYear();
        const searchPrefix = `${prefix}-${currentYear}-`;

        const latestStudent = await tx.student.findFirst({
          where: {
            studentNumber: { startsWith: searchPrefix },
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            studentNumber: true,
          },
        });

        let nextSequence = 1;
        if (latestStudent && latestStudent.studentNumber) {
          const parts = latestStudent.studentNumber.split("-");
          const lastNumber = parseInt(parts[2], 10);
          nextSequence = lastNumber + 1;
        }

        const generatedStudentNumber = `${searchPrefix}${String(nextSequence).padStart(4, "0")}`;

        return await tx.student.create({
          data: {
            ...data,
            studentNumber: generatedStudentNumber,
            userId: userId || undefined,
          },
        });
      },
    );

    return newStudent;
  }

  async getStudents(
    params: GetStudentParams,
  ): Promise<PaginatedStudentResponse> {
    const page = params.page && params.page >= 1 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
    };

    if (params.searchQuery && params.searchQuery.trim() !== "") {
      where.OR = [
        { firstName: { contains: params.searchQuery, mode: "insensitive" } },
        { lastName: { contains: params.searchQuery, mode: "insensitive" } },
        { lastName: { contains: params.searchQuery, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  async getStudentById(studentId: string) {
    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        emergencyContacts: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    return student;
  }

  async updateStudent(
    studentId: string,
    updateData: Prisma.StudentUncheckedUpdateInput,
  ) {
    const existingUser = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingUser) {
      throw new AppError("Student not found", 404);
    }

    const validationChecks: Promise<void>[] = [];

    if (updateData.studentNumber) {
      validationChecks.push(
        prisma.student
          .findFirst({
            where: {
              studentNumber: updateData.studentNumber as string,
              id: { not: studentId },
              deletedAt: null,
            },
          })
          .then((result: unknown) => {
            if (result)
              throw new AppError(
                "Student number is already taken by another student",
                409,
              );
          }),
      );
    }

    if (updateData.userId) {
      validationChecks.push(
        prisma.student
          .findFirst({
            where: {
              userId: updateData.userId as string,
              id: { not: studentId },
              deletedAt: null,
            },
          })
          .then((result: unknown) => {
            if (result)
              throw new AppError(
                "This user account is already linked to another student",
                409,
              );
          }),
      );
    }

    if (validationChecks.length > 0) {
      await Promise.all(validationChecks);
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    return updatedStudent;
  }

  async softDeleteStudent(studentId: string) {
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!existingStudent) {
      throw new AppError("Student not found", 404);
    }

    if (existingStudent.deletedAt !== null) {
      throw new AppError("Student already deleted", 400);
    }

    const updateStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        deletedAt: new Date(),
      },
    });

    return updateStudent;
  }

//   async linkUserToStudent() {}
}

export const studentService = new StudentService();