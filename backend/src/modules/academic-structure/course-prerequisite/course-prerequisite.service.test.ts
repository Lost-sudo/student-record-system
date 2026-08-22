import { prisma } from "../../../database/prisma.js";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils.js";
import { CourseRepository } from "../course/course.repository.js";
import { CoursePrerequisiteRepository } from "./course-prerequisite.repository.js";
import { CoursePrerequisiteService } from "./course-prerequisite.service.js";
import { CreateCoursePrerequisiteInput } from "./course-prerequisite.validator.js";

jest.mock("../../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) =>
    typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2002",
}));

jest.mock("../../../database/prisma.js", () => ({
  prisma: {
    coursePrerequisite: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findById: jest.fn(),
      findCourseAndPrerequisite: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      findById: jest.fn(),
    },

    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));

const mockPrisma = prisma as unknown as {
  course: {
    findUnique: jest.Mock;
    findById: jest.Mock;
  };
  coursePrerequisite: {
    findFirst: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findById: jest.Mock;
    findCourseAndPrerequisite: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe("Course Prerequisite Service", () => {
  let service: CoursePrerequisiteService;

  const courseId = "11111111-1111-1111-1111-111111111111";
  const prerequisiteId = "22222222-2222-2222-2222-222222222222";
  const relationId = "33333333-3333-3333-3333-333333333333";

  const mockCourse = {
    id: courseId,
    courseCode: "CS201",
  };

  const mockPrerequisite = {
    id: prerequisiteId,
    courseCode: "CS101",
  };

  const mockRelation = {
    id: relationId,
    courseId: courseId,
    prerequisiteId: prerequisiteId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const courseRepo = new CourseRepository(prisma as never);
    const coursePrerequisiteRepo = new CoursePrerequisiteRepository(
      prisma as never,
    );

    service = new CoursePrerequisiteService(coursePrerequisiteRepo, courseRepo);
  });

  describe("create", () => {
    const createInput: CreateCoursePrerequisiteInput = {
      courseId,
      prerequisiteId,
    };

    it("should successfully create the relationship and return a DTO", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce(mockPrerequisite);
      mockPrisma.coursePrerequisite.findFirst.mockResolvedValue(null);
      mockPrisma.coursePrerequisite.create.mockResolvedValue(mockRelation);

      const result = await service.create(createInput);

      expect(mockPrisma.coursePrerequisite.create).toHaveBeenCalledWith({
        data: createInput,
      });
      expect(result).toEqual({
        id: mockRelation.id,
        courseId: mockRelation.courseId,
        prerequisiteId: mockRelation.prerequisiteId,
        createdAt: mockRelation.createdAt,
      });
    });

    it("should throw BadRequestError if courseId equals prerequisiteId", async () => {
      const input = { courseId, prerequisiteId: courseId };

      await expect(service.create(input)).rejects.toThrow(BadRequestError);
      await expect(service.create(input)).rejects.toThrow(
        "A course cannot be a prerequisite itself",
      );
    });

    it("should throw NotFoundError if the main course is not found", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockPrerequisite);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course not found");
    });

    it("should throw NotFoundError if the prerequisite course is not found", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce(null);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Prerequisite course not found");
    });

    it("should throw ConflictError if the relationship already exist in the repository", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce(mockPrerequisite);

      mockPrisma.coursePrerequisite.findFirst.mockResolvedValue(mockRelation);

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This prerequisite already exist for the course",
      );
    });

    it("should throw InternalServerError if unknown error occurs during creation", async () => {
      mockPrisma.course.findUnique
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce(mockPrerequisite);
      mockPrisma.coursePrerequisite.findFirst.mockResolvedValue(null);

      mockPrisma.coursePrerequisite.create.mockRejectedValue(
        new Error("Database connection lost"),
      );

      const promise = service.create(createInput);

      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow(
        "Failed to create course-prerequisite relationship",
      );
    });
  });

  describe("delete", () => {
    it("should delete the relationship successfully", async () => {
      mockPrisma.coursePrerequisite.findUnique.mockResolvedValue(mockRelation);
      mockPrisma.coursePrerequisite.delete.mockResolvedValue(mockRelation);

      await service.delete(relationId);

      expect(mockPrisma.coursePrerequisite.delete).toHaveBeenCalledWith({
        where: { id: relationId },
      });
    });

    it("should throw NotFoundError if the relationship does not exist", async () => {
      mockPrisma.coursePrerequisite.findUnique.mockResolvedValue(null);

      const promise = service.delete(relationId);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow(
        "Course-prerequisite relationship not found",
      );
    });

    it("should throw InternalServerError if an unknown error occurs during deletion", async () => {
      mockPrisma.coursePrerequisite.findUnique.mockResolvedValue(mockRelation);
      mockPrisma.coursePrerequisite.delete.mockRejectedValue(
        new Error("Database connection lost"),
      );

      const promise = service.delete(relationId);

      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow(
        "Failed to delete course-prerequisite relationship",
      );
    });
  });
});
