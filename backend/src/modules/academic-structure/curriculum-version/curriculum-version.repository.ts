import {
  CurriculumVersion,
  Prisma,
  PrismaClient,
} from "../../../generated/prisma/client";
import {
  CreateCurriculumVersionInput,
  CurriculumVersionQueryInput,
  UpdateCurriculumVersionInput,
} from "./curriculum-version.validator";

export class CurriculumVersionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCurriculumVersionInput): Promise<CurriculumVersion> {
    return this.prisma.curriculumVersion.create({
      data: {
        programId: data.programId,
        effectiveTermId: data.effectiveTermId,
        totalCredits: data.totalCredits,
        versionNumber: data.versionNumber,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async findById(id: string): Promise<CurriculumVersion | null> {
    return this.prisma.curriculumVersion.findUnique({
      where: { id },
    });
  }

  async findByProgramAndVersion(
    programId: string,
    versionNumber: number,
  ): Promise<CurriculumVersion | null> {
    return this.prisma.curriculumVersion.findFirst({
      where: { programId, versionNumber },
    });
  }

  async update(
    id: string,
    data: UpdateCurriculumVersionInput,
  ): Promise<CurriculumVersion> {
    return this.prisma.curriculumVersion.update({
      where: { id },
      data: {
        versionNumber: data.versionNumber,
        totalCredits: data.totalCredits,
        description: data.description,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string): Promise<CurriculumVersion> {
    return this.prisma.curriculumVersion.delete({
      where: { id },
    });
  }

  async findMany(
    query: CurriculumVersionQueryInput,
  ): Promise<{ items: CurriculumVersion[]; total: number }> {
    const where: Prisma.CurriculumVersionWhereInput = {
      ...(query.programId ? { programId: query.programId } : {}),
      ...(query.effectiveTermId
        ? { effectiveTermId: query.effectiveTermId }
        : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.CurriculumVersionOrderByWithRelationInput;

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.curriculumVersion.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
      }),

      this.prisma.curriculumVersion.count({ where }),
    ]);

    return { items, total };
  }
}
