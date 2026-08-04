import { StudentService } from "./student.service";
import { StudentRepository } from "./student.repository";
import { prisma } from "../../database/prisma";
import { AppError } from "../../middlewares/error.middleware";

jest.mock("../../database/prisma", () => ({
  prisma: {
    student: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((cb: (tx: any) => any) => cb(prisma)),
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
    mockPrisma.$transaction.mockImplementation((cb: (tx: any) => any) => cb(prisma));
  });

  const mockStudent = {
    id: "student-123",
    studentNumber: "STU-2026-0001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
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

    it("should throw AppError if user account is already linked to another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);

      await expect(
        studentService.createStudent(studentInput, "user-123")
      ).rejects.toThrow(AppError);

      await expect(
        studentService.createStudent(studentInput, "user-123")
      ).rejects.toThrow("This user account is already linked to another student");

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
      });
      expect(result).toEqual({
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
      });
      expect(result.page).toBe(1);
    });
  });

  describe("getStudents", () => {
    it("should return student details including emergency contacts", async () => {
      const studentWithContacts = {
        ...mockStudent,
        emergencyContacts: [
          { id: "ec-1", name: "Jane Doe", relationship: "Mother", phone: "123456" },
        ],
      };
      mockPrisma.student.findFirst.mockResolvedValue(studentWithContacts);

      const result = await studentService.getStudentById("student-123");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { id: "student-123", deletedAt: null },
        include: {
          emergencyContacts: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
      expect(result).toEqual(studentWithContacts);
    });

    it("should throw AppError if student is not found", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await expect(studentService.getStudentById("invalid-id")).rejects.toThrow(AppError);
      await expect(studentService.getStudentById("invalid-id")).rejects.toThrow(
        "Student not found"
      );
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

      expect(mockPrisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: "student-123" },
      });
      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: "student-123" },
        data: { firstName: "Jane" },
      });
      expect(result.firstName).toBe("Jane");
    });

    it("should throw AppError if target student to update is not found", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await expect(
        studentService.updateStudent("non-existent-id", { firstName: "Jane" })
      ).rejects.toThrow("Student not found");

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw AppError if updated studentNumber is already taken by another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);
      mockPrisma.student.findFirst.mockResolvedValue({ id: "student-456" });

      await expect(
        studentService.updateStudent("student-123", {
          studentNumber: "STU-2026-9999",
        })
      ).rejects.toThrow("Student number is already taken by another student");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          studentNumber: "STU-2026-9999",
          id: { not: "student-123" },
          deletedAt: null,
        },
      });
      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw AppError if updated userId is already linked to another student", async () => {
      mockPrisma.student.findFirst.mockResolvedValueOnce(mockStudent);
      mockPrisma.student.findFirst.mockResolvedValue({ id: "student-456" });

      await expect(
        studentService.updateStudent("student-123", {
          userId: "user-456",
        })
      ).rejects.toThrow("This user account is already linked to another student");

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
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      const deletedStudentMock = { ...mockStudent, deletedAt: new Date() };
      mockPrisma.student.update.mockResolvedValue(deletedStudentMock);

      const result = await studentService.softDeleteStudent("student-123");

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
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

    it("should throw AppError if student is not found", async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      await expect(studentService.softDeleteStudent("invalid-id")).rejects.toThrow(
        "Student not found"
      );

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });

    it("should throw AppError if student is already deleted", async () => {
      const alreadyDeletedStudent = { ...mockStudent, deletedAt: new Date() };
      mockPrisma.student.findFirst.mockResolvedValue(alreadyDeletedStudent);

      await expect(studentService.softDeleteStudent("student-123")).rejects.toThrow(
        "Student already deleted"
      );

      expect(mockPrisma.student.update).not.toHaveBeenCalled();
    });
  });
});
