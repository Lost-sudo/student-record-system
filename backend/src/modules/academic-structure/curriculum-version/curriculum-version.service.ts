import { CurriculumVersion } from "../../../generated/prisma/client.js";
import {
  AppError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils.js";
import { buildPaginationMeta, PaginationMeta } from "../../../utils/pagination.js";
import {
  isForeignKeyConstraintViolation,
  isUniqueConstraintViolation,
} from "../../../utils/prisma-error.utils.js";
import { AcademicProgramRepository } from "../academic-program/academic-program.repository.js";
import { AcademicTermRepository } from "../academic-term/academic-term.repository.js";
import { CurriculumVersionRepository } from "./curriculum-version.repository.js";
import { CurriculumVersionDto } from "./curriculum-version.types.js";
import {
  CreateCurriculumVersionInput,
  CurriculumVersionQueryInput,
  UpdateCurriculumVersionInput,
} from "./curriculum-version.validator.js";

export class CurriculumVersionService {
  constructor(
    private readonly curriculumVersionRepository: CurriculumVersionRepository,
    private readonly academicProgramRepository: AcademicProgramRepository,
    private readonly academicTermRepository: AcademicTermRepository,
  ) {}

  async create(
    input: CreateCurriculumVersionInput,
  ): Promise<CurriculumVersionDto> {
    const [program, term] = await Promise.all([
      this.academicProgramRepository.findById(input.programId),
      this.academicTermRepository.findById(input.effectiveTermId),
    ]);

    if (!program) {
      throw new NotFoundError("Academic program not found");
    }

    if (!term) {
      throw new NotFoundError("Academic term not found");
    }

    const existing =
      await this.curriculumVersionRepository.findByProgramAndVersion(
        input.programId,
        input.versionNumber,
      );

    if (existing) {
      throw new ConflictError(
        "This curriculum version already exists for the program",
      );
    }

    try {
      const curriculum = await this.curriculumVersionRepository.create(input);

      return this.toDto(curriculum);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(
          "This curriculum version already exists for the program",
        );
      }
      throw new InternalServerError("Failed to create curriculum version");
    }
  }

  async getById(id: string): Promise<CurriculumVersionDto> {
    const curriculum = await this.curriculumVersionRepository.findById(id);

    if (!curriculum) {
      throw new NotFoundError("Curriculum version not found");
    }

    return this.toDto(curriculum);
  }

  async update(
    id: string,
    input: UpdateCurriculumVersionInput,
  ): Promise<CurriculumVersionDto> {
    const existing = await this.getById(id);

    if (input.versionNumber && input.versionNumber !== existing.versionNumber) {
      const duplicate =
        await this.curriculumVersionRepository.findByProgramAndVersion(
          existing.programId,
          input.versionNumber,
        );

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "This curriculum version already exists for the program",
        );
      }
    }

    try {
      const updated = await this.curriculumVersionRepository.update(id, input);

      return this.toDto(updated);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("This curriculum version already exists");
      }

      throw new InternalServerError("Failed to update curriculum version");
    }
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    try {
      await this.curriculumVersionRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isForeignKeyConstraintViolation(error)) {
        throw new ConflictError(
          "Cannot delete this curriculum version it has requirements",
        );
      }

      throw new InternalServerError("Failed to delete curriculum version");
    }
  }

  async list(
    query: CurriculumVersionQueryInput,
  ): Promise<{ items: CurriculumVersionDto[]; meta: PaginationMeta }> {
    const { items, total } =
      await this.curriculumVersionRepository.findMany(query);

    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private toDto(model: CurriculumVersion): CurriculumVersionDto {
    return {
      id: model.id,
      programId: model.programId,
      effectiveTermId: model.effectiveTermId,
      totalCredits: model.totalCredits,
      description: model.description,
      versionNumber: model.versionNumber,
      isActive: model.isActive,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
