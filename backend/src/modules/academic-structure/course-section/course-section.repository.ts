import {
  CourseSection,
  Prisma,
  PrismaClient,
} from "../../../generated/prisma/client.js";
import {
  CourseSectionQueryInput,
  CreateCourseSectionInput,
  UpdateCourseSectionInput,
} from "./course-section.validator.js";

export class CourseSectionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCourseSectionInput): Promise<CourseSection> {
    return this.prisma.courseSection.create({
      data: {
        courseId: data.courseId,
        termId: data.termId,
        sectionNumber: data.sectionNumber,
        capacity: data.capacity,
        enrolledCount: 0,
      },
    });
  }

  async findById(id: string): Promise<CourseSection | null> {
    return this.prisma.courseSection.findUnique({
      where: { id },
    });
  }

  async findByCourseTermAndSection(
    courseId: string,
    termId: string,
    sectionNumber: string,
  ): Promise<CourseSection | null> {
    return this.prisma.courseSection.findFirst({
      where: {
        courseId,
        termId,
        sectionNumber,
      },
    });
  }

  async update(
    id: string,
    data: UpdateCourseSectionInput,
  ): Promise<CourseSection> {
    return this.prisma.courseSection.update({
      where: { id },
      data: {
        sectionNumber: data.sectionNumber,
        capacity: data.capacity,
      },
    });
  }

  async delete(id: string): Promise<CourseSection> {
    return this.prisma.courseSection.delete({
      where: { id },
    });
  }

  async findMany(
    query: CourseSectionQueryInput,
  ): Promise<{ items: CourseSection[]; total: number }> {
    const where: Prisma.CourseSectionWhereInput = {
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.termId ? { termId: query.termId } : {}),
      ...(query.search
        ? {
            sectionNumber: {
              contains: query.search,
              mode: "insensitive",
            },
          }
        : {}),
    };

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.CourseSectionOrderByWithRelationInput;

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.courseSection.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
      }),

      this.prisma.courseSection.count({ where }),
    ]);

    return { items, total };
  }
}
