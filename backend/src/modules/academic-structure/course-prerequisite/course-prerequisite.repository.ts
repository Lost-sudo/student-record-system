import { CoursePrerequisite, Prisma, PrismaClient } from '../../../generated/prisma/client';
import { CoursePrerequisiteQueryInput, CreateCoursePrerequisiteInput } from './course-prerequisite.validator';

export class CoursePrerequisiteRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateCoursePrerequisiteInput): Promise<CoursePrerequisite> {
        return this.prisma.coursePrerequisite.create({
            data,
        });
    };

    async findById(id: string): Promise<CoursePrerequisite | null> {
        return this.prisma.coursePrerequisite.findUnique({
            where: { id },
        });
    };

    async findCourseAndPrerequisite(courseId: string, prerequisiteId: string): Promise<CoursePrerequisite | null> {
        return this.prisma.coursePrerequisite.findFirst({
            where: {
                courseId,
                prerequisiteId
            },
        });
    };

    async delete(id: string): Promise<CoursePrerequisite> {
        return this.prisma.coursePrerequisite.delete({
            where: { id },
        });
    };

    async findMany(query: CoursePrerequisiteQueryInput): Promise<{items: CoursePrerequisite[]; total: number}> {
        const where: Prisma.CoursePrerequisiteWhereInput = {
            ...(query.courseId ? { courseId: query.courseId } : {}),
            ...(query.prerequisiteId ? { prerequisiteId: query.prerequisiteId } : {})
        };

        const skip = (query.page - 1) * query.limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.coursePrerequisite.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: query.limit,
            }),
            this.prisma.coursePrerequisite.count({ where }),
        ]);

        return { items, total };
    }
}