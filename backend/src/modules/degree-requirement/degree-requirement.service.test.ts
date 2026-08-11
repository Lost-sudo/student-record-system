import { ConflictError, NotFoundError } from "../../utils/error.utils";
import { CourseRepository } from "../academic-structure/course/course.repository";
import { CurriculumVersionRepository } from "../academic-structure/curriculum-version/curriculum-version.repository";
import { DegreeRequirementRepository } from "./degree-requirement.repository";
import { DegreeRequirementService } from "./degree-requirement.service";

jest.mock("../../utils/prisma-error.utils", () => ({
  isPrismaKnownRequestError: (error: unknown) =>
    typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) =>
    (error as { code?: string } | null)?.code === "P2025",
}));

const mockDegreeRequirementRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findMany: jest.fn(),
  findByCurriculumAndCourse: jest.fn(),
};

const mockCurriculumVersionRepository = {
  findById: jest.fn(),
};

const mockCourseRepository = {
  findById: jest.fn(),
};

describe("Degree Requirement Service", () => {
  let service: DegreeRequirementService;

  const curriculumId = "11111111-1111-1111-1111-111111111111";
  const courseId = "22222222-2222-2222-2222-222222222222";
  const otherCourseId = "33333333-3333-3333-3333-333333333333";
  const requirementId = "44444444-4444-4444-4444-444444444444";
  const otherRequirementId = "55555555-5555-5555-5555-555555555555";

  const mockCurriculum = { id: curriculumId, versionNumber: 1 };
  const mockCourse = { id: courseId, courseCode: "CS101" };
  const mockOtherCourse = { id: otherCourseId, courseCode: "CS102" };

  const mockRequirement = {
    id: requirementId,
    curriculumId,
    requirementType: "CORE",
    minCredits: 3,
    courseId,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  const mockOtherRequirement = {
    ...mockRequirement,
    id: otherRequirementId,
    courseId: otherCourseId,
  };

  const createInputWithCourse = {
    curriculumId,
    requirementType: "CORE" as const,
    minCredits: 3,
    courseId,
  };

  const createInputWithoutCourse = {
    curriculumId,
    requirementType: "ELECTIVE" as const,
    minCredits: 12,
    courseId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new DegreeRequirementService(
      mockDegreeRequirementRepository as unknown as DegreeRequirementRepository,
      mockCurriculumVersionRepository as unknown as CurriculumVersionRepository,
      mockCourseRepository as unknown as CourseRepository,
    );
  });

  describe("create", () => {
    it("throws NotFoundError if curriculum version is not found", async () => {
      mockCurriculumVersionRepository.findById.mockResolvedValue(null);

      const promise = service.create(createInputWithCourse);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Curriculum version not found");
    });

    it("throws NotFoundError if course is not found when courseId is provided", async () => {
      mockCurriculumVersionRepository.findById.mockResolvedValue(mockCurriculum);
      mockCourseRepository.findById.mockResolvedValue(null);

      const promise = service.create(createInputWithCourse);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course not found");
    });

    it("throws ConflictError if the course already exists as a requirement for this curriculum", async () => {
      mockCurriculumVersionRepository.findById.mockResolvedValue(mockCurriculum);
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      mockDegreeRequirementRepository.findByCurriculumAndCourse.mockResolvedValue(
        mockRequirement,
      );

      const promise = service.create(createInputWithCourse);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This course already exists as a requirement for this curriculum",
      );
    });

    it("creates requirement successfully with courseId", async () => {
      mockCurriculumVersionRepository.findById.mockResolvedValue(mockCurriculum);
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      mockDegreeRequirementRepository.findByCurriculumAndCourse.mockResolvedValue(
        null,
      );
      mockDegreeRequirementRepository.create.mockResolvedValue(mockRequirement);

      const result = await service.create(createInputWithCourse);

      expect(result.id).toBe(requirementId);
      expect(result.curriculumId).toBe(curriculumId);
      expect(result.courseId).toBe(courseId);
      expect(result.requirementType).toBe("CORE");
      expect(result.minCredits).toBe(3);
      expect(
        mockDegreeRequirementRepository.create,
      ).toHaveBeenCalledWith(createInputWithCourse);
    });

    it("creates requirement successfully without courseId", async () => {
      mockCurriculumVersionRepository.findById.mockResolvedValue(mockCurriculum);
      mockDegreeRequirementRepository.create.mockResolvedValue({
        ...mockRequirement,
        courseId: null,
        requirementType: "ELECTIVE",
        minCredits: 12,
      });

      const result = await service.create(createInputWithoutCourse);

      expect(result.courseId).toBeNull();
      expect(result.requirementType).toBe("ELECTIVE");
      expect(result.minCredits).toBe(12);
      // Course validation should be skipped entirely
      expect(mockCourseRepository.findById).not.toHaveBeenCalled();
      expect(
        mockDegreeRequirementRepository.findByCurriculumAndCourse,
      ).not.toHaveBeenCalled();
      expect(
        mockDegreeRequirementRepository.create,
      ).toHaveBeenCalledWith(createInputWithoutCourse);
    });
  });

  describe("getById", () => {
    it("returns degree requirement by id", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);

      const result = await service.getById(requirementId);

      expect(result.id).toBe(requirementId);
      expect(result.curriculumId).toBe(curriculumId);
      expect(result.courseId).toBe(courseId);
      expect(result.requirementType).toBe("CORE");
      expect(result.minCredits).toBe(3);
    });

    it("throws NotFoundError if degree requirement does not exist", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(null);

      const promise = service.getById(requirementId);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Degree requirement not found");
    });
  });

  describe("update", () => {
    const updateInput = { courseId: otherCourseId, minCredits: 4 };

    it("throws NotFoundError if requirement to update does not exist", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(null);

      const promise = service.update(requirementId, updateInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Degree requirement not found");
    });

    it("throws NotFoundError if new course is not found", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockCourseRepository.findById.mockResolvedValue(null);

      const promise = service.update(requirementId, updateInput);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Course not found");
    });

    it("throws ConflictError if new course already exists as a requirement for another record in the same curriculum", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockCourseRepository.findById.mockResolvedValue(mockOtherCourse);
      mockDegreeRequirementRepository.findByCurriculumAndCourse.mockResolvedValue(
        mockOtherRequirement,
      );

      const promise = service.update(requirementId, updateInput);

      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This course already exists as a requirement for this curriculum",
      );
    });

    it("allows updating with the same courseId (no conflict for current record)", async () => {
      const sameCourseInput = { courseId, minCredits: 5 };

      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
      // findByCurriculumAndCourse returns the SAME record being updated
      mockDegreeRequirementRepository.findByCurriculumAndCourse.mockResolvedValue(
        mockRequirement,
      );
      mockDegreeRequirementRepository.update.mockResolvedValue({
        ...mockRequirement,
        minCredits: 5,
      });

      const result = await service.update(requirementId, sameCourseInput);

      expect(result.minCredits).toBe(5);
      expect(result.courseId).toBe(courseId);
    });

    it("updates requirement successfully", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockCourseRepository.findById.mockResolvedValue(mockOtherCourse);
      mockDegreeRequirementRepository.findByCurriculumAndCourse.mockResolvedValue(
        null,
      );
      mockDegreeRequirementRepository.update.mockResolvedValue({
        ...mockRequirement,
        courseId: otherCourseId,
        minCredits: 4,
      });

      const result = await service.update(requirementId, updateInput);

      expect(result.courseId).toBe(otherCourseId);
      expect(result.minCredits).toBe(4);
      expect(
        mockDegreeRequirementRepository.update,
      ).toHaveBeenCalledWith(requirementId, updateInput);
    });

    it("updates requirement successfully without courseId (skips course validation)", async () => {
      const updateWithoutCourse = { minCredits: 6 };

      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockDegreeRequirementRepository.update.mockResolvedValue({
        ...mockRequirement,
        minCredits: 6,
      });

      const result = await service.update(requirementId, updateWithoutCourse);

      expect(result.minCredits).toBe(6);
      expect(mockCourseRepository.findById).not.toHaveBeenCalled();
      expect(
        mockDegreeRequirementRepository.findByCurriculumAndCourse,
      ).not.toHaveBeenCalled();
      expect(
        mockDegreeRequirementRepository.update,
      ).toHaveBeenCalledWith(requirementId, updateWithoutCourse);
    });
  });

  describe("delete", () => {
    it("throws NotFoundError if requirement does not exist", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(null);

      const promise = service.delete(requirementId);

      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Degree requirement not found");
    });

    it("deletes requirement successfully", async () => {
      mockDegreeRequirementRepository.findById.mockResolvedValue(mockRequirement);
      mockDegreeRequirementRepository.delete.mockResolvedValue(mockRequirement);

      await expect(service.delete(requirementId)).resolves.not.toThrow();

      expect(
        mockDegreeRequirementRepository.delete,
      ).toHaveBeenCalledWith(requirementId);
    });
  });

  describe("list", () => {
    it("returns paginated items and metadata", async () => {
      const query = { page: 1, limit: 10, curriculumId };

      mockDegreeRequirementRepository.findMany.mockResolvedValue({
        items: [mockRequirement],
        total: 1,
      });

      const result = await service.list(query);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(requirementId);
      expect(result.items[0].curriculumId).toBe(curriculumId);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("returns empty items array when no requirements exist", async () => {
      const query = { page: 1, limit: 10, curriculumId };

      mockDegreeRequirementRepository.findMany.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.list(query);

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it("correctly calculates multiple pages", async () => {
      const query = { page: 2, limit: 10, curriculumId };

      mockDegreeRequirementRepository.findMany.mockResolvedValue({
        items: [mockRequirement],
        total: 25,
      });

      const result = await service.list(query);

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.page).toBe(2);
    });
  });
});