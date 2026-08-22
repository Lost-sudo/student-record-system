import { AcademicTerm, Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { AcademicTermQueryInput, CreateAcademicTermInput, UpdateAcademicTermInput } from "./academic-term.types.js";

export class AcademicTermRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async create(data: CreateAcademicTermInput): Promise<AcademicTerm> {
        return this.prisma.academicTerm.create({
            data,
        });
    }

    async findById(id: string): Promise<AcademicTerm | null> {
        return this.prisma.academicTerm.findUnique({
            where: { id },
        });
    }

    async findByTermCode(termCode: string): Promise<AcademicTerm | null> {
        return this.prisma.academicTerm.findUnique({
            where: { termCode },
        });
    }

    async update(id: string, data: UpdateAcademicTermInput): Promise<AcademicTerm> {
        return this.prisma.academicTerm.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<AcademicTerm> {
        return this.prisma.academicTerm.delete({
            where: { id },
        });
    }

    async findMany(query: AcademicTermQueryInput): Promise<{items: AcademicTerm[]; total: number}> {
        const where: Prisma.AcademicTermWhereInput = {
            ...(query.isActive !== undefined ? { isActive: query.isActive }: {}),
            ...(query.search ? {
                OR: [
                    {
                        termCode: {
                            contains: query.search,
                            mode: 'insensitive'
                        },
                    },
                    {
                        name: {
                            contains: query.search,
                            mode: 'insensitive',
                        }
                    },
                ],
            }: {}),
        };

        const orderBy = {
            [query.sortBy]: query.sortOrder,
        } as Prisma.AcademicTermOrderByWithRelationInput;

        const skip = (query.page - 1) * query.limit;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.academicTerm.findMany({
                where,
                orderBy,
                skip,
                take: query.limit,
            }),
            this.prisma.academicTerm.count({ where }),
        ]);

        return { items, total };
    }
}