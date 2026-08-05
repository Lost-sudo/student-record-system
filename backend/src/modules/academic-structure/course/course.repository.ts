import { Course, Prisma, PrismaClient } from "../../../generated/prisma/client";
import { CourseQueryInput, CreateCourseInput, UpdateCourseInput } from "./course.types";
import { CourseWhereInput } from '../../../generated/prisma/models/Course';

export class CourseRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: CreateCourseInput): Promise<Course> {
        return this.prisma.course.create({
            data: {
                courseCode: data.courseCode,
                title: data.title,
                description: data.description ?? null,
                defaultCredits: data.defaultCredits,
                isActive: data.isActive,
            },
        });
    };

    async findById(id: string): Promise<Course | null> {
        return this.prisma.course.findUnique({
            where: { id },
        });
    };

    async findByCourseCode(courseCode: string): Promise<Course | null> {
        return this.prisma.course.findUnique({
            where: { courseCode }
        });
    };

    async update(id: string, data: UpdateCourseInput): Promise<Course> {
        return this.prisma.course.update({
            where: { id },
            data: {
                courseCode: data.courseCode,
                title: data.title,
                description: data.description,
                defaultCredits: data.defaultCredits,
                isActive: data.isActive,
            },
        });
    };

    async delete(id: string): Promise<Course> {
        return this.prisma.course.delete({
            where: { id },
        });
    };

    async findMany(query: CourseQueryInput): Promise<{ items: Course[]; total: number }> {
        const where: Prisma.CourseWhereInput = {
            ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
            ...(query.search
                ? {
                    OR: [
                        {
                            courseCode: {
                                contains: query.search,
                                mode: 'insensitive',
                            },

                        },
                        {
                            title: {
                                contains: query.search,
                                mode: 'insensitive',
                            }
                        }
                    ]
                } : {}
            ),
        };

        const orderBy = {
            [query.sortBy]: query.sortOrder,
        } as Prisma.CourseOrderByWithRelationInput;

        const skip = (query.page - 1) * query.limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.course.findMany({
                where,
                orderBy,
                skip,
                take: query.limit
            }),
            this.prisma.course.count({ where }),
        ]);

        return { items, total }
    }
}