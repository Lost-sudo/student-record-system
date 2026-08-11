import { prisma } from "../../../database/prisma";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils";
import { AcademicTermRepository } from "../academic-term/academic-term.repository";
import { CourseRepository } from "../course/course.repository";
import { CourseSectionRepository } from "./course-section.repository";
import { CourseSectionService } from "./course-section.service";

jest.mock("../../../utils/prisma-error.utils", () => ({
  isPrismaKnownRequestError: (error: unknown) =>
    typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2025",
}));

jest.mock("../../../database/prisma", () => ({
  prisma: {
    courseSection: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    academicTerm: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));

const mockPrisma = prisma as unknown as {
  courseSection: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };
  course: { findUnique: jest.Mock };
  academicTerm: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

describe("Course Section Service", () => {
  let service: CourseSectionService;

  const courseId = "11111111-1111-1111-1111-111111111111";
  const termId = "22222222-2222-2222-2222-222222222222";
  const sectionId = "33333333-3333-3333-3333-333333333333";
  const otherSectionId = "44444444-4444-4444-4444-444444444444";

  const mockCourse = { id: courseId, courseCode: "CS101" };
  const mockTerm = { id: termId, termCode: "FALL-2026" };

  const mockSection = {
    id: sectionId,
    courseId,
    termId,
    sectionNumber: "001",
    capacity: 40,
    enrolledCount: 15,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const mockOtherSection = {
    ...mockSection,
    id: otherSectionId,
    sectionNumber: "002",
  };

  const createInput = {
    courseId,
    termId,
    sectionNumber: "001",
    capacity: 40,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const sectionRepo = new CourseSectionRepository(prisma as never);
    const courseRepo = new CourseRepository(prisma as never);
    const termRepo = new AcademicTermRepository(prisma as never);

    service = new CourseSectionService(sectionRepo, courseRepo, termRepo);
  });

  describe("create", () => {
    it("throws NotFoundError if course is not found", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course not found");
    });

    it("throws NotFoundError if academic term is not found", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(null);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Academic term not found");
    });

    it("throws ConflictError if section number already exists for this course and term", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.courseSection.findFirst.mockResolvedValue(mockSection);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This section number already exist for this course and selected term",
      );
    });

    it("creates course section successfully", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.courseSection.findFirst.mockResolvedValue(null);
      mockPrisma.courseSection.create.mockResolvedValue(mockSection);

      const result = await service.create(createInput);

      expect(result.id).toBe(sectionId);
      expect(result.courseId).toBe(courseId);
      expect(result.termId).toBe(termId);
      expect(result.sectionNumber).toBe("001");
      expect(result.capacity).toBe(40);
      expect(result.enrolledCount).toBe(15);
      expect(mockPrisma.courseSection.create).toHaveBeenCalledWith({
        data: { ...createInput, enrolledCount: 0 },
      });
    });

    it("throws ConflictError on Prisma unique constraint violation (P2002)", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.courseSection.findFirst.mockResolvedValue(null);
      mockPrisma.courseSection.create.mockRejectedValue({ code: "P2002" });

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This section number already exist for this course and selected term",
      );
    });

    it("throws InternalServerError on unknown database error", async () => {
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.courseSection.findFirst.mockResolvedValue(null);
      mockPrisma.courseSection.create.mockRejectedValue(new Error("DB down"));

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow("Failed to create course section");
    });
  });

  describe("getById", () => {
    it("returns course section by id", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);

      const result = await service.getById(sectionId);

      expect(result.id).toBe(sectionId);
      expect(result.courseId).toBe(courseId);
      expect(result.termId).toBe(termId);
      expect(result.sectionNumber).toBe("001");
      expect(result.capacity).toBe(40);
      expect(result.enrolledCount).toBe(15);
    });

    it("throws NotFoundError if course section does not exist", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(null);

      const promise = service.getById(sectionId);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course section not found");
    });
  });

  describe("update", () => {
    it("throws NotFoundError if course section to update does not exist", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(null);

      const promise = service.update(sectionId, { capacity: 50 });

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course section not found");
    });

    it("throws BadRequestError if capacity is lower than current enrolled count", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);

      const promise = service.update(sectionId, { capacity: 10 });

      await expect(promise).rejects.toThrow(BadRequestError);
      await expect(promise).rejects.toThrow(
        "Capacity cannot be lower than the current enrolled count",
      );
    });

    it("allows setting capacity equal to enrolled count", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.update.mockResolvedValue({
        ...mockSection,
        capacity: 15,
      });

      const result = await service.update(sectionId, { capacity: 15 });

      expect(result.capacity).toBe(15);
    });

    it("throws ConflictError if new section number already exists for another section", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.findFirst.mockResolvedValue(mockOtherSection);

      const promise = service.update(sectionId, { sectionNumber: "002" });

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This section number already exists for this course in the selected term",
      );
    });

    it("allows updating with the same section number (no conflict)", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.findFirst.mockResolvedValue(mockSection);
      mockPrisma.courseSection.update.mockResolvedValue(mockSection);

      const result = await service.update(sectionId, { sectionNumber: "001" });

      expect(result.id).toBe(sectionId);
      expect(result.sectionNumber).toBe("001");
    });

    it("skips duplicate check when sectionNumber is not provided", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.update.mockResolvedValue({
        ...mockSection,
        capacity: 60,
      });

      const result = await service.update(sectionId, { capacity: 60 });

      expect(result.capacity).toBe(60);
      expect(mockPrisma.courseSection.findFirst).not.toHaveBeenCalled();
    });

    it("updates course section successfully", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.findFirst.mockResolvedValue(null);
      mockPrisma.courseSection.update.mockResolvedValue({
        ...mockSection,
        sectionNumber: "003",
        capacity: 50,
      });

      const updateInput = { sectionNumber: "003", capacity: 50 };
      const result = await service.update(sectionId, updateInput);

      expect(result.sectionNumber).toBe("003");
      expect(result.capacity).toBe(50);
      expect(mockPrisma.courseSection.update).toHaveBeenCalledWith({
        where: { id: sectionId },
        data: updateInput,
      });
    });

    it("throws ConflictError on Prisma unique constraint violation during update (P2002)", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.findFirst.mockResolvedValue(null);
      mockPrisma.courseSection.update.mockRejectedValue({ code: "P2002" });

      const promise = service.update(sectionId, { sectionNumber: "003" });

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This section number already exists for this course in the selected term",
      );
    });

    it("throws InternalServerError on unknown database error during update", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.update.mockRejectedValue(new Error("DB down"));

      const promise = service.update(sectionId, { capacity: 60 });

      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow("Failed to update course section");
    });
  });

  describe("delete", () => {
    it("throws NotFoundError if course section does not exist", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(null);

      const promise = service.delete(sectionId);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course section not found");
    });

    it("deletes course section successfully", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.delete.mockResolvedValue(mockSection);

      await expect(service.delete(sectionId)).resolves.not.toThrow();

      expect(mockPrisma.courseSection.delete).toHaveBeenCalledWith({
        where: { id: sectionId },
      });
    });

    it("throws ConflictError on Prisma foreign key constraint violation (P2003)", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.delete.mockRejectedValue({ code: "P2003" });

      const promise = service.delete(sectionId);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "Cannot delete this section because it has enrollments",
      );
    });

    it("throws InternalServerError on unknown database error during delete", async () => {
      mockPrisma.courseSection.findUnique.mockResolvedValue(mockSection);
      mockPrisma.courseSection.delete.mockRejectedValue(new Error("DB down"));

      const promise = service.delete(sectionId);

      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow("Failed to delete course section");
    });
  });

  describe("list", () => {
    it("returns paginated items and metadata", async () => {
      const query = {
        page: 1,
        limit: 10,
        courseId,
        termId,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      mockPrisma.courseSection.findMany.mockResolvedValue([mockSection]);
      mockPrisma.courseSection.count.mockResolvedValue(1);

      const result = await service.list(query);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(sectionId);
      expect(result.items[0].sectionNumber).toBe("001");
      expect(result.items[0].enrolledCount).toBe(15);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("returns empty items array when no sections exist", async () => {
      const query = {
        page: 1,
        limit: 10,
        courseId,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      mockPrisma.courseSection.findMany.mockResolvedValue([]);
      mockPrisma.courseSection.count.mockResolvedValue(0);

      const result = await service.list(query);

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it("correctly calculates multiple pages", async () => {
      const query = {
        page: 2,
        limit: 10,
        termId,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      mockPrisma.courseSection.findMany.mockResolvedValue([mockSection]);
      mockPrisma.courseSection.count.mockResolvedValue(35);

      const result = await service.list(query);

      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
    });
  });
});
