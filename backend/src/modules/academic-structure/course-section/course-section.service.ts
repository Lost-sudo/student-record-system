import { CourseSection } from "../../../generated/prisma/client";
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils";
import { buildPaginationMeta, PaginationMeta } from "../../../utils/pagination";
import {
  isForeignKeyConstraintViolation,
  isUniqueConstraintViolation,
} from "../../../utils/prisma-error.utils";
import { AcademicTermRepository } from "../academic-term/academic-term.repository";
import { CourseRepository } from "../course/course.repository";
import { CourseSectionRepository } from "./course-section.repository";
import {
  CourseSectionDto,
  CourseSectionQueryInput,
  CreateCourseSectionInput,
  UpdateCourseSectionInput,
} from "./course-section.types";

export class CourseSectionService {
  constructor(
    private readonly courseSectionRepository: CourseSectionRepository,
    private readonly courseRepository: CourseRepository,
    private readonly academicTermRepository: AcademicTermRepository,
  ) {}

  async create(input: CreateCourseSectionInput): Promise<CourseSectionDto> {
    const [course, term] = await Promise.all([
      this.courseRepository.findById(input.courseId),
      this.academicTermRepository.findById(input.termId),
    ]);

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!term) {
      throw new NotFoundError("Academic term not found");
    }

    const existing =
      await this.courseSectionRepository.findByCourseTermAndSection(
        input.courseId,
        input.termId,
        input.sectionNumber,
      );

    if (existing) {
      throw new ConflictError(
        "This section number already exist for this course and selected term",
      );
    }

    try {
      const section = await this.courseSectionRepository.create(input);
      return this.toDto(section);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(
          "This section number already exist for this course and selected term",
        );
      }
      throw new InternalServerError("Failed to create course section");
    }
  }

  async getById(id: string): Promise<CourseSectionDto> {
    const section = await this.courseSectionRepository.findById(id);

    if (!section) {
      throw new NotFoundError("Course section not found");
    }

    return this.toDto(section);
  }

  async update(
    id: string,
    input: UpdateCourseSectionInput,
  ): Promise<CourseSectionDto> {
    const existing = await this.getById(id);

    if (
      input.capacity !== undefined &&
      input.capacity < existing.enrolledCount
    ) {
      throw new BadRequestError(
        "Capacity cannot be lower than the current enrolled count",
      );
    }

    if (input.sectionNumber && input.sectionNumber !== existing.sectionNumber) {
      const duplicate =
        await this.courseSectionRepository.findByCourseTermAndSection(
          existing.courseId,
          existing.termId,
          input.sectionNumber,
        );

      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(
          "This section number already exists for this course in the selected term",
        );
      }
    }

    try {
      const updated = await this.courseSectionRepository.update(id, input);
      return this.toDto(updated);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(
          "This section number already exists for this course in the selected term",
        );
      }

      throw new InternalServerError("Failed to update course section");
    }
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    try {
      await this.courseSectionRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isForeignKeyConstraintViolation(error)) {
        throw new ConflictError(
          "Cannot delete this section because it has enrollments",
        );
      }
      throw new InternalServerError("Failed to delete course section");
    }
  }

  async list(
    query: CourseSectionQueryInput,
  ): Promise<{ items: CourseSectionDto[]; meta: PaginationMeta }> {
    const { items, total } = await this.courseSectionRepository.findMany(query);

    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private toDto(model: CourseSection): CourseSectionDto {
    return {
      id: model.id,
      courseId: model.courseId,
      termId: model.termId,
      sectionNumber: model.sectionNumber,
      capacity: model.capacity,
      enrolledCount: model.enrolledCount,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
