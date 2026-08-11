import {
  DegreeRequirement,
  Prisma,
  PrismaClient,
} from "../../generated/prisma/client";
import {
  CreateDegreeRequirementInput,
  DegreeRequirementQueryInput,
  UpdateDegreeRequirementInput,
} from "./degree-requirement.types";

export class DegreeRequirementRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateDegreeRequirementInput): Promise<DegreeRequirement> {
    return this.prisma.degreeRequirement.create({
      data: {
        curriculumId: data.curriculumId,
        requirementType: data.requirementType,
        minCredits: data.minCredits,
        courseId: data.courseId,
      },
    });
  }

  async findById(id: string): Promise<DegreeRequirement | null> {
    return this.prisma.degreeRequirement.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    data: UpdateDegreeRequirementInput,
  ): Promise<DegreeRequirement> {
    return this.prisma.degreeRequirement.update({
      where: { id },
      data: {
        requirementType: data.requirementType,
        minCredits: data.minCredits,
        courseId: data.courseId,
      },
    });
  }

  async delete(id: string): Promise<DegreeRequirement> {
    return this.prisma.degreeRequirement.delete({
      where: { id },
    });
  }

  async findMany(
    query: DegreeRequirementQueryInput,
  ): Promise<{ items: DegreeRequirement[]; total: number }> {
    const where: Prisma.DegreeRequirementWhereInput = {
      ...(query.curriculumId ? { curriculumId: query.curriculumId } : {}),
      ...(query.requirementType
        ? { requirementType: query.requirementType }
        : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.degreeRequirement.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.limit,
      }),
      this.prisma.degreeRequirement.count({ where }),
    ]);

    return { items, total };
  }

  async findByCurriculumAndCourse(
    curriculumId: string,
    courseId: string,
  ): Promise<DegreeRequirement | null> {
    return this.prisma.degreeRequirement.findFirst({
      where: {
        curriculumId,
        courseId,
      },
    });
  }
}
