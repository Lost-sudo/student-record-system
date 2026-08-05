import { Course } from "../../../generated/prisma/client";
import { AppError } from "../../../middlewares/error.middleware";
import { buildPaginationMeta, PaginationMeta } from "../../../utils/pagination";
import { CourseRepository } from "./course.repository";
import { CourseDto, CourseQueryInput, CreateCourseInput, UpdateCourseInput } from "./course.types";

export class CourseService {
    constructor(private readonly courseRepository: CourseRepository) {}

    async create(input: CreateCourseInput): Promise<CourseDto> {
        try {
            const course = await this.courseRepository.create(input);
            
            if (!course) {
                throw new AppError("A course with this course already exist", 409);
            }
            
            return this.toDto(course);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError("There is an error creating a course", 500);
        }
    };

    async getById(id: string): Promise<CourseDto> {
        const course = await this.courseRepository.findById(id);

        if (!course) {
            throw new AppError("Course not found", 404);
        }

        return this.toDto(course);
    }

    async update(id: string, input: UpdateCourseInput): Promise<CourseDto> {
        await this.getById(id);

        try {
            const updated = await this.courseRepository.update(id, input);

            if (!updated) {
                throw new AppError("Failed to update course ", 400);
            }

            return this.toDto(updated);
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError("There is an error updating the course", 500)
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.courseRepository.delete(id);
        } catch (error) {
            throw new AppError("Failed to delete course", 500);
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