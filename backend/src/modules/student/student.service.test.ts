import { StudentService } from "./student.service.js";
import { StudentRepository } from "./student.repository.js";
import { prisma } from "../../database/prisma.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/error.utils.js";

jest.mock("../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

jest.mock("../../database/prisma.js", () => ({
  prisma: {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn((arg: any) => {
      if (typeof arg === "function") {
        return arg(prisma);
      }

      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }

      return arg;
    }),
  },
}));

const mockPrisma = prisma as unknown as {
  student: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    count: jest.Mock;
    groupBy: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe("StudentService", () => {
  let studentService: StudentService;
  let studentRepository: StudentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    studentRepository = new StudentRepository(prisma as never);
    studentService = new StudentService(studentRepository);
    mockPrisma.$transaction.mockImplementation((arg: any) => {
      if (typeof arg === "function") {
        return arg(prisma);
      }

      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }

      return arg;
    });
  });

  const mockStudent = {
    id: "student-123",
    studentNumber: "STU-2026-0001",
    firstName: "John",
    lastName: "Doe",
    userId: "user-123",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createStudent", () => {
    const studentInput = {
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date(),
      gender: "Male",
      nationality: "Filipino"
    };

    it("should successfully create a student without userId and auto-generate first student number", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null); // latestStudent is null
      mockPrisma.student.create.mockResolvedValue({
        id: "student-123",
        ...studentInput,
        studentNumber: `STU-${new Date().getFullYear()}-0001`,
        userId: undefined,
      });

      const result = await studentService.createStudent(studentInput);

      const currentYear = new Date().getFullYear();
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          studentNumber: { startsWith: `STU-${currentYear}-` },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
        select: { studentNumber: true },
      });

      expect(mockPrisma.student.create).toHaveBeenCalledWith({
        data: {
          ...studentInput,
          studentNumber: `STU-${currentYear}-0001`,
          userId: undefined,
        },
      });

      expect(result.studentNumber).toBe(`STU-${currentYear}-0001`);
    });

    it("should increment sequence number based on existing latest student number", async () => {
      const currentYear = new Date().getFullYear();
      mockPrisma.student.findFirst.mockResolvedValue({
        studentNumber: `STU-${currentYear}-0005`,
      });
      mockPrisma.student.create.mockResolvedValue({
        id: "student-124",
        ...studentInput,
        studentNumber: `STU-${currentYear}-0006`,
      });

      const result = await studentService.createStudent(studentInput);

      expect(mockPrisma.student.create).toHaveBeenCalledWith({
        data: {
          ...studentInput,
          studentNumber: `STU-${currentYear}-0006`,
          userId: undefined,
        },
      });
      expect(result.studentNumber).toBe(`STU-${currentYear}-0006`);
    });

    it("should create student linked to user when userId is provided and not already linked", async () => {
      // First findFirst call is for checking existing user link (outside transaction)
      // Second findFirst call is for sequence calculation inside transaction
      mockPrisma.student.findFirst
        .mockResolvedValueOnce(null) // No existing link for userId
        .mockResolvedValueOnce(null); // No previous student number

      const currentYear = new Date().getFullYear();
      mockPrisma.student.create.mockResolvedValue({
        id: "student-123",
        ...studentInput,
        studentNumber: `STU-${currentYear}-0001`,
        userId: "user-123",
      });

      const result = await studentService.createStudent(studentInput, "user-123");

      expect(mockPrisma.student.findFirst).toHaveBeenNthCalledWith(1, {
        where: { userId: "user-123", deletedAt: null },
      });
      expect(result.userId).toBe("user-123");
    });

    it("should throw ConflictError if user account is already linked to another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);

      const createPromise = studentService.createStudent(studentInput, "user-123");
      await expect(createPromise).rejects.toThrow(ConflictError);
      await expect(createPromise).rejects.toThrow("This user account is already linked to another student");

      expect(mockPrisma.student.create).not.toHaveBeenCalled();
    });
  });

  describe("getStudentById", () => {
    it("should return paginated students with default parameters", async () => {
      mockPrisma.student.count.mockResolvedValue(1);
      mockPrisma.student.findMany.mockResolvedValue([mockStudent]);

      const result = await studentService.getStudents({});

      expect(mockPrisma.student.count).toHaveBeenCalledWith({
        where: { deletedAt: null },
      });
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { contactInfo: true },
      });
      expect(result).toMatchObject({
        data: [mockStudent],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });

    it("should correctly handle custom page, limit, and searchQuery", async () => {
      mockPrisma.student.count.mockResolvedValue(25);
      mockPrisma.student.findMany.mockResolvedValue([mockStudent]);

      const params = { page: 2, limit: 10, searchQuery: "John" };
      const result = await studentService.getStudents(params);

      const expectedWhere = {
        deletedAt: null,
        OR: [
          { firstName: { contains: "John", mode: "insensitive" } },
          { lastName: { contains: "John", mode: "insensitive" } },
          { studentNumber: { contains: "John", mode: "insensitive" } },
        ],
      };

      expect(mockPrisma.student.count).toHaveBeenCalledWith({ where: expectedWhere });
      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        skip: 10,
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { contactInfo: true },
      });
      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10) = 3
    });

    it("should fallback to page 1 and limit 20 for invalid pagination input", async () => {
      mockPrisma.student.count.mockResolvedValue(0);
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await studentService.getStudents({ page: -1, limit: 0 });

      expect(mockPrisma.student.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { contactInfo: true },
      });
      expect(result.page).toBe(1);
    });
  });

  describe("getStudents", () => {
    it("should return student details", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);

      const result = await studentService.getStudentById("student-123");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { id: "student-123", deletedAt: null },
        include: {
          emergencyContacts: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      expect(result).toMatchObject(mockStudent);
    });

    it("should throw NotFoundError if student is not found", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const promise = studentService.getStudentById("invalid-id");
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Student not found");
    });
  });

  describe("updateStudent", () => {
    it("should successfully update student without duplicate checks if studentNumber/userId are not passed", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);
      const updatedMock = { ...mockStudent, firstName: "Jane" };
      mockPrisma.student.update.mockResolvedValue(updatedMock);

      const result = await studentService.updateStudent("student-123", {
        firstName: "Jane",
      });

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { id: "student-123", deletedAt: null },
        include: {
          emergencyContacts: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-123" },
        data: { firstName: "Jane" },
      });
      expect(result.firstName).toBe("Jane");
    });

    it("should throw NotFoundError if target student to update is not found", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const promise = studentService.updateStudent("non-existent-id", { firstName: "Jane" });
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Student not found");

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictError if updated studentNumber is already taken by another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);
      mockPrisma.student.findFirst.mockResolvedValue({ id: "student-456" });

      const promise = studentService.updateStudent("student-123", {
        studentNumber: "STU-2026-9999",
      });
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow("Student number is already taken by another student");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          studentNumber: "STU-2026-9999",
          id: { not: "student-123" },
          deletedAt: null,
        },
      });
      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw ConflictError if updated userId is already linked to another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);
      mockPrisma.student.findFirst.mockResolvedValue({ id: "student-456" });

      const promise = studentService.updateStudent("student-123", {
        userId: "user-456",
      });
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow("This user account is already linked to another student");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          userId: "user-456",
          id: { not: "student-123" },
          deletedAt: null,
        },
      });
      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });
  });

  describe("softDeleteStudent", () => {
    it("should successfully soft delete an active student", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);
      const deletedStudentMock = { ...mockStudent, deletedAt: new Date() };
      mockPrisma.student.update.mockResolvedValue(deletedStudentMock);

      const result = await studentService.softDeleteStudent("student-123");

      expect(mockPrisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: "student-123" },
      });
      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-123" },
        data: {
          deletedAt: expect.any(Date),
        },
      });
      expect(result.deletedAt).not.toBeNull();
    });

    it("should throw NotFoundError if student is not found", async () => {
      mockPrisma.student.findUnique.mockResolvedValue(null);

      const promise = studentService.softDeleteStudent("invalid-id");
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Student not found");

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if student is already deleted", async () => {
      const alreadyDeletedStudent = { ...mockStudent, deletedAt: new Date() };
      mockPrisma.student.findUnique.mockResolvedValue(alreadyDeletedStudent);

      const promise = studentService.softDeleteStudent("student-123");
      await expect(promise).rejects.toThrow(BadRequestError);
      await expect(promise).rejects.toThrow("Student already deleted");

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });
  });

  describe("getStats", () => {
    it("should return active, new this week/month/last month and archived counts", async () => {
      mockPrisma.student.count
        .mockResolvedValueOnce(100) // total active
        .mockResolvedValueOnce(4) // new this week
        .mockResolvedValueOnce(12) // new this month
        .mockResolvedValueOnce(9) // new last month
        .mockResolvedValueOnce(34); // total archived
      mockPrisma.student.groupBy
        .mockResolvedValueOnce([
          { gender: "male", _count: { _all: 60 } },
          { gender: "female", _count: { _all: 38 } },
          { gender: null, _count: { _all: 2 } },
        ])
        .mockResolvedValueOnce([
          { nationality: "American", _count: { _all: 5 } },
          { nationality: "FILIPINO", _count: { _all: 90 } },
          { nationality: "filipino", _count: { _all: 5 } },
          { nationality: null, _count: { _all: 0 } },
        ]);

      const result = await studentService.getStats();

      expect(result).toEqual({
        totalActiveStudents: 100,
        newStudentsThisWeek: 4,
        newStudentsThisMonth: 12,
        newStudentsLastMonth: 9,
        totalArchivedStudents: 34,
        genderDistribution: [
          { gender: "male", count: 60 },
          { gender: "female", count: 38 },
          { gender: null, count: 2 },
        ],
        nationalityDistribution: [
          { nationality: "American", count: 5 },
          { nationality: "FILIPINO", count: 90 },
          { nationality: "filipino", count: 5 },
          { nationality: null, count: 0 },
        ],
      });

      expect(mockPrisma.student.count).toHaveBeenCalledTimes(5);
      const whereClauses = mockPrisma.student.count.mock.calls.map(
        ([args]: [{ where: Record<string, unknown> }]) => args.where,
      );
      expect(whereClauses[0]).toEqual({ deletedAt: null });
      for (const clause of whereClauses.slice(1, 4)) {
        expect(clause).toMatchObject({ deletedAt: null });
        expect((clause as { createdAt?: unknown }).createdAt).toBeDefined();
      }
      expect(whereClauses[4]).toEqual({ deletedAt: { not: null } });

      expect(mockPrisma.student.groupBy).toHaveBeenNthCalledWith(1, {
        by: ["gender"],
        where: { deletedAt: null },
        _count: { _all: true },
        orderBy: { gender: "asc" },
      });
      expect(mockPrisma.student.groupBy).toHaveBeenNthCalledWith(2, {
        by: ["nationality"],
        where: { deletedAt: null },
        _count: { _all: true },
        orderBy: { nationality: "asc" },
      });
    });
  });
});
