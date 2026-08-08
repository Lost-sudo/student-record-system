import { prisma } from "../../../database/prisma";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils";
import { AcademicProgramRepository } from "../academic-program/academic-program.repository";
import { AcademicTermRepository } from "../academic-term/academic-term.repository";
import { CurriculumVersionRepository } from "./curriculum-version.repository";
import { CurriculumVersionService } from "./curriculum-version.service";

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
    curriculumVersion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    academicProgram: {
      findUnique: jest.fn(),
    },
    academicTerm: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));

const mockPrisma = prisma as unknown as {
  curriculumVersion: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };
  academicProgram: { findUnique: jest.Mock };
  academicTerm: { findUnique: jest.Mock };
  $transaction: jest.Mock;
};

describe("Curriculum Version Service", () => {
  let service: CurriculumVersionService;

  const programId = "prog-123";
  const termId = "term-123";
  const curriculumId = "curr-123";
  const otherCurriculumId = "curr-456";

  const mockProgram = { id: programId, programCode: "BS-CS" };
  const mockTerm = { id: termId, termCode: "FALL-2026" };

  const mockCurriculum = {
    id: curriculumId,
    programId,
    effectiveTermId: termId,
    versionNumber: 1,
    totalCredits: 120,
    description: "Initial version",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const mockOtherCurriculum = {
    ...mockCurriculum,
    id: otherCurriculumId,
    versionNumber: 2,
  };

  const createInput = {
    programId,
    effectiveTermId: termId,
    versionNumber: 1,
    totalCredits: 120,
    description: "Initial version",
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    const curriculumRepo = new CurriculumVersionRepository(prisma as never);
    const programRepo = new AcademicProgramRepository(prisma as never);
    const termRepo = new AcademicTermRepository(prisma as never);

    service = new CurriculumVersionService(
      curriculumRepo,
      programRepo,
      termRepo,
    );
  });

  describe("create", () => {
    it("throws NotFoundError if academic program is not found", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(null);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);

      const promise = service.create(createInput);
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Academic program not found");
    });

    it("throws NotFoundError if academic term is not found", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(mockProgram);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(null);

      const promise = service.create(createInput);
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Academic term not found");
    });

    it("throws ConflictError if curriculum version already exists (via findFirst)", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(mockProgram);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(mockCurriculum);

      const promise = service.create(createInput);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This curriculum version already exists for the program",
      );
    });

    it("creates curriculum version successfully", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(mockProgram);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.create.mockResolvedValue(mockCurriculum);

      const result = await service.create(createInput);

      expect(result.id).toBe(curriculumId);
      expect(mockPrisma.curriculumVersion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          programId,
          effectiveTermId: termId,
          versionNumber: 1,
        }),
      });
    });

    it("throws ConflictError on Prisma unique constraint violation (P2002)", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(mockProgram);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.create.mockRejectedValue({ code: "P2002" });

      const promise = service.create(createInput);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This curriculum version already exists for the program",
      );
    });

    it("throws InternalServerError on unknown database error", async () => {
      mockPrisma.academicProgram.findUnique.mockResolvedValue(mockProgram);
      mockPrisma.academicTerm.findUnique.mockResolvedValue(mockTerm);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.create.mockRejectedValue(
        new Error("DB down"),
      );

      const promise = service.create(createInput);
      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow(
        "Failed to create curriculum version",
      );
    });
  });

  describe("getById", () => {
    it("returns curriculum version by id", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);

      const result = await service.getById(curriculumId);
      expect(result.id).toBe(curriculumId);
    });

    it("throws NotFoundError if curriculum version does not exist", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(null);

      const promise = service.getById(curriculumId);
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Curriculum version not found");
    });
  });

  describe("update", () => {
    const updateInput = { versionNumber: 2, totalCredits: 125 };

    it("updates curriculum version successfully", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.update.mockResolvedValue({
        ...mockCurriculum,
        ...updateInput,
      });

      const result = await service.update(curriculumId, updateInput);

      expect(result.versionNumber).toBe(2);
      expect(result.totalCredits).toBe(125);
    });

    it("throws NotFoundError if curriculum version to update does not exist", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(null);

      const promise = service.update(curriculumId, updateInput);
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Curriculum version not found");
    });

    it("throws ConflictError if new version number already exists for another curriculum", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(
        mockOtherCurriculum,
      );

      const promise = service.update(curriculumId, updateInput);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This curriculum version already exists for the program",
      );
    });

    it("throws ConflictError on Prisma unique constraint violation (P2002)", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.update.mockRejectedValue({ code: "P2002" });

      const promise = service.update(curriculumId, updateInput);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "This curriculum version already exists",
      );
    });

    it("throws InternalServerError on unknown database error", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.findFirst.mockResolvedValue(null);
      mockPrisma.curriculumVersion.update.mockRejectedValue(
        new Error("DB down"),
      );

      const promise = service.update(curriculumId, updateInput);
      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow(
        "Failed to update curriculum version",
      );
    });
  });

  describe("delete", () => {
    it("deletes curriculum version successfully", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.delete.mockResolvedValue(mockCurriculum);

      await expect(service.delete(curriculumId)).resolves.not.toThrow();
      expect(mockPrisma.curriculumVersion.delete).toHaveBeenCalledWith({
        where: { id: curriculumId },
      });
    });

    it("throws NotFoundError if curriculum version does not exist", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(null);

      const promise = service.delete(curriculumId);
      await expect(promise).rejects.toThrow(NotFoundError);
      await expect(promise).rejects.toThrow("Curriculum version not found");
    });

    it("throws ConflictError on Prisma foreign key constraint violation (P2003)", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.delete.mockRejectedValue({ code: "P2003" });

      const promise = service.delete(curriculumId);
      await expect(promise).rejects.toThrow(ConflictError);
      await expect(promise).rejects.toThrow(
        "Cannot delete this curriculum version it has requirements",
      );
    });

    it("throws InternalServerError on unknown database error", async () => {
      mockPrisma.curriculumVersion.findUnique.mockResolvedValue(mockCurriculum);
      mockPrisma.curriculumVersion.delete.mockRejectedValue(
        new Error("DB down"),
      );

      const promise = service.delete(curriculumId);
      await expect(promise).rejects.toThrow(InternalServerError);
      await expect(promise).rejects.toThrow(
        "Failed to delete curriculum version",
      );
    });
  });

  describe("list", () => {
    it("returns paginated items and metadata", async () => {
      const query = {
        page: 1,
        limit: 10,
        programId,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
      };

      mockPrisma.curriculumVersion.findMany.mockResolvedValue([mockCurriculum]);
      mockPrisma.curriculumVersion.count.mockResolvedValue(1);

      const result = await service.list(query);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(curriculumId);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });
});
