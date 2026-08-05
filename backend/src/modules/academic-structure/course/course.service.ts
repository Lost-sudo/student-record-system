import { Course } from "../../../generated/prisma/client";
import { AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../utils/error.utils";
import { isForeignKeyConstraintViolation, isPrismaRecordNotFound, isUniqueConstraintViolation } from "../../../utils/prisma-error.utils";
import { buildPaginationMeta, PaginationMeta } from "../../../utils/pagination";
import { CourseRepository } from "./course.repository";
import { CourseDto, CourseQueryInput, CreateCourseInput, UpdateCourseInput } from "./course.types";

export class CourseService {
    constructor(private readonly courseRepository: CourseRepository) {}

    async create(input: CreateCourseInput): Promise<CourseDto> {
        try {
            const course = await this.courseRepository.create(input);
            
            if (!course) {
                throw new ConflictError("A course with this course already exist");
            }
            
            return this.toDto(course);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("A course with this course already exist");
            }
            throw new InternalServerError("There is an error creating a course");
        }
    };

    async getById(id: string): Promise<CourseDto> {
        const course = await this.courseRepository.findById(id);

        if (!course) {
            throw new NotFoundError("Course not found");
        }

        return this.toDto(course);
    }

    async update(id: string, input: UpdateCourseInput): Promise<CourseDto> {
        await this.getById(id);

        try {
            const updated = await this.courseRepository.update(id, input);

            if (!updated) {
                throw new BadRequestError("Failed to update course ");
            }

            return this.toDto(updated);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("A course with this course already exist");
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError("Course not found");
            }

            throw new InternalServerError("There is an error updating the course")
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.courseRepository.delete(id);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            if (isForeignKeyConstraintViolation(error)) {
                throw new ConflictError("Failed to delete course");
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError("Course not found");
            }
            throw new InternalServerError("Failed to delete course");
        }
    };

    async list(query: CourseQueryInput): Promise<{items: CourseDto[]; meta: PaginationMeta}> {
        const { items, total } = await this.courseRepository.findMany(query);

        return {
            items: items.map((item) => this.toDto(item)),
            meta: buildPaginationMeta(query.page, query.limit, total),
        };
    }

    private toDto(model: Course): CourseDto {
        return {
            id: model.id,
            courseCode: model.courseCode,
            title: model.title,
            description: model.description,
            defaultCredits: model.defaultCredits,
            isActive: model.isActive,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        }
    }
}