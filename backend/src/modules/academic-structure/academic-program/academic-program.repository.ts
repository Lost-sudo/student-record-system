import { AcademicProgram, Prisma, PrismaClient } from '../../../generated/prisma/client';
import { AcademicProgramQueryInput, CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.validator';

export class AcademicProgramRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async create(data: CreateAcademicProgramInput): Promise<AcademicProgram> {
        return this.prisma.academicProgram.create({
            data: {
                programCode: data.programCode,
                name: data.name,
                degreeType: data.degreeType,
                description: data.description ?? null,
                isActive: data.isActive,
            }
        });
    }

    async findById(id: string): Promise<AcademicProgram | null> {
        return this.prisma.academicProgram.findUnique({
            where: { id }
        });
    }

    async findByProgramcode(programCode: string): Promise<AcademicProgram | null> {
        return this.prisma.academicProgram.findUnique({
            where: { programCode: programCode },
        });
    }

    async update(id: string, data: UpdateAcademicProgramInput): Promise<AcademicProgram> {
        return this.prisma.academicProgram.update({
            where: { id },
            data: {
                programCode: data.programCode,
                name: data.name,
                degreeType: data.degreeType,
                description: data.description,
                isActive: data.isActive,
            }
        });
    }

    async delete(id: string): Promise<AcademicProgram> {
        return this.prisma.academicProgram.delete({
            where: { id },
        })
    }

    async findMany(query: AcademicProgramQueryInput): Promise<{items: AcademicProgram[], total: number}> {
        const where: Prisma.AcademicProgramWhereInput = {
            ...(query.isActive !== undefined ? { isActive: query.isActive }: {}),
            ...(query.degreeType ? { degreeType: query.degreeType }: {}),
            ...(query.search 
                ? {
                    OR: [
                        {
                            programCode: {
                                contains: query.search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            name: {
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
        } as Prisma.AcademicProgramOrderByWithRelationInput;

        const skip = ( query.page - 1 ) * query.limit;

        const [ items, total ] = await this.prisma.$transaction([
            this.prisma.academicProgram.findMany({
                where,
                orderBy,
                skip,
                take: query.limit
            }),

            this.prisma.academicProgram.count({ where }),
        ]);

        return { items, total };
    }
}