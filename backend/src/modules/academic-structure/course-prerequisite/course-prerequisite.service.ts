import { CoursePrerequisite } from "../../../generated/prisma/client.js";
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../utils/error.utils.js";
import { buildPaginationMeta, PaginationMeta } from "../../../utils/pagination.js";
import { isUniqueConstraintViolation } from "../../../utils/prisma-error.utils.js";
import { CourseRepository } from "../course/course.repository.js";
import { CoursePrerequisiteRepository } from "./course-prerequisite.repository.js";
import {
  CoursePrerequisiteDto,
  CoursePrerequisiteQueryInput,
} from "./course-prerequisite.types.js";
import { CreateCoursePrerequisiteInput } from "./course-prerequisite.validator.js";

export class CoursePrerequisiteService {
  constructor(
    private readonly coursePrerequisiteRepository: CoursePrerequisiteRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async create(
    input: CreateCoursePrerequisiteInput,
  ): Promise<CoursePrerequisiteDto> {
    if (input.courseId === input.prerequisiteId) {
      throw new BadRequestError("A course cannot be a prerequisite itself");
    }

    const [course, prerequisite] = await Promise.all([
      this.courseRepository.findById(input.courseId),
      this.courseRepository.findById(input.prerequisiteId),
    ]);

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (!prerequisite) {
      throw new NotFoundError("Prerequisite course not found");
    }

    const existing =
      await this.coursePrerequisiteRepository.findCourseAndPrerequisite(
        input.courseId,
        input.prerequisiteId,
      );

    if (existing) {
      throw new ConflictError("This prerequisite already exist for the course");
    }

    try {
      const created = await this.coursePrerequisiteRepository.create(input);

      return this.toDto(created);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError(
          "This course-prerequisite relationship already exists",
        );
      }

      throw new InternalServerError(
        "Failed to create course-prerequisite relationship",
      );
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.coursePrerequisiteRepository.findById(id);

    if (!existing) {
      throw new NotFoundError("Course-prerequisite relationship not found");
    }

    try {
      await this.coursePrerequisiteRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new InternalServerError(
        "Failed to delete course-prerequisite relationship",
      );
    }
  }

  async list(
    query: CoursePrerequisiteQueryInput,
  ): Promise<{ items: CoursePrerequisiteDto[]; meta: PaginationMeta }> {
    const { items, total } =
      await this.coursePrerequisiteRepository.findMany(query);

    return {
      items: items.map((item) => this.toDto(item)),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  private toDto(model: CoursePrerequisite): CoursePrerequisiteDto {
    return {
      id: model.id,
      courseId: model.courseId,
      prerequisiteId: model.prerequisiteId,
      createdAt: model.createdAt,
    };
  }
}
