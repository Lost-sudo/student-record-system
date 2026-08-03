import { th } from 'zod/v4/locales/index.js';
import { AcademicProgram } from '../../../generated/prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
import { PaginationMeta, buildPaginationMeta } from '../../../utils/pagination';
import { AcademicProgramRepository } from './academic-program.repository';
import { AcademicProgramDto, AcademicProgramQueryInput, CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.types';

export class AcademicProgramService {
    constructor(private readonly academicProgramRepository: AcademicProgramRepository) { }

    async create(input: CreateAcademicProgramInput): Promise<AcademicProgramDto> {
        try {
            const program = await this.academicProgramRepository.create(input);
            return this.toDto(program);
        } catch (error) {
            throw new AppError("A program with this program code already exists", 409);
        }
    }

    async getById(id: string): Promise<AcademicProgramDto> {
        const program = await this.academicProgramRepository.findById(id);

        if (!program) {
            throw new AppError("Academic program not found", 404);
        }

        return this.toDto(program);
    }

    async update(id: string, input: UpdateAcademicProgramInput): Promise<AcademicProgramDto> {
        await this.getById(id);

        try {
            const updated = await this.academicProgramRepository.update(id, input);
            return this.toDto(updated);
        } catch (error) {
            throw new AppError("Academic program with this program code already exists", 409);
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.academicProgramRepository.delete(id);
        } catch (error) {
            throw new AppError("Failed to delete this program code", 500);
        }
    }

    async list(query: AcademicProgramQueryInput): Promise<{items: AcademicProgramDto[], meta: PaginationMeta}> {
        const { items, total } = await this.academicProgramRepository.findMany(query);

        return {
            items: items.map((item) => this.toDto(item)),
            meta: buildPaginationMeta(query.page, query.limit, total),
        }
    }

    private toDto(model: AcademicProgram): AcademicProgramDto {
        return {
            id: model.id,
            programCode: model.programCode,
            name: model.name,
            degreeType: model.degreeType,
            description: model.description,
            isActive: model.isActive,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt
        }
    }
}