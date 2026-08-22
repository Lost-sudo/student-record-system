import { CurriculumVersion } from "../../generated/prisma/client.js";
import { ConflictError, NotFoundError } from "../../utils/error.utils.js";
import { buildPaginationMeta, PaginationMeta } from "../../utils/pagination.js";
import { CourseRepository } from "../academic-structure/course/course.repository.js";
import { CurriculumVersionRepository } from "../academic-structure/curriculum-version/curriculum-version.repository.js";
import { DegreeRequirementRepository } from "./degree-requirement.repository.js";
import { DegreeRequirementDto } from "./degree-requirement.types.js";
import {
  CreateDegreeRequirementInput,
  DegreeRequirementQueryInput,
  UpdateDegreeRequirementInput,
} from "./degree-requirement.validator.js";

export class DegreeRequirementService {
  constructor(
    private readonly degreeRequirementRepository: DegreeRequirementRepository,
    private readonly curriculumVersionRepository: CurriculumVersionRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async create(
    input: CreateDegreeRequirementInput,
  ): Promise<DegreeRequirementDto> {
    const curriculum = await this.curriculumVersionRepository.findById(
      input.curriculumId,
    );

    if (!curriculum) {
      throw new NotFoundError("Curriculum version not found");
    }

    if (input.courseId) {
      const course = await this.courseRepository.findById(input.courseId);

      if (!course) {
        throw new NotFoundError("Course not found");
      }

      const existing =
        await this.degreeRequirementRepository.findByCurriculumAndCourse(
          input.curriculumId,
          input.courseId,
        );

      if (existing) {
        throw new ConflictError(
          "This course already exists as a requirement for this curriculum",
        );
      }
    }

    const created = await this.degreeRequirementRepository.create(input);

    return this.toDto(created);
  }

  async getById(id: string): Promise<DegreeRequirementDto> {
    const requirement = await this.degreeRequirementRepository.findById(id);

    if (!requirement) {
      throw new NotFoundError("Degree requirement not found");
    }

    return this.toDto(requirement);
  }

  async update(
    id: string,
    input: UpdateDegreeRequirementInput,
  ): Promise<DegreeRequirementDto> {
    const existing = await this.getById(id);

    if (input.courseId) {
      const course = await this.courseRepository.findById(input.courseId);

      if (!course) {
        throw new NotFoundError("Course not found");
      }

      const duplicate =
        await this.degreeRequirementRepository.findByCurriculumAndCourse(
          existing.curriculumId,
          input.courseId,
        );

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "This course already exists as a requirement for this curriculum",
        );
      }
    }

    const updated = await this.degreeRequirementRepository.update(id, input);

    return this.toDto(updated);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.degreeRequirementRepository.delete(id);
  }

  async list(
    query: DegreeRequirementQueryInput,
  ): Promise<{ items: DegreeRequirementDto[]; meta: PaginationMeta }> {
    const { items, total } =
      await this.degreeRequirementRepository.findMany(query);

    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private toDto(model: DegreeRequirementDto): DegreeRequirementDto {
    return {
      id: model.id,
      curriculumId: model.curriculumId,
      requirementType: model.requirementType,
      minCredits: model.minCredits,
      courseId: model.courseId,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
