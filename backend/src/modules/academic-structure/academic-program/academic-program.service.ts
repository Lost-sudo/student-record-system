import { AcademicProgram } from '../../../generated/prisma/client.js';
import { AppError, ConflictError, InternalServerError, NotFoundError } from '../../../utils/error.utils.js';
import { isForeignKeyConstraintViolation, isPrismaRecordNotFound, isUniqueConstraintViolation } from '../../../utils/prisma-error.utils.js';
import { PaginationMeta, buildPaginationMeta } from '../../../utils/pagination.js';
import { AcademicProgramRepository } from './academic-program.repository.js';
import { AcademicProgramDto, AcademicProgramQueryInput, CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.types.js';

export class AcademicProgramService {
    constructor(private readonly academicProgramRepository: AcademicProgramRepository) { }

    async create(input: CreateAcademicProgramInput): Promise<AcademicProgramDto> {
        try {
            const program = await this.academicProgramRepository.create(input);
            return this.toDto(program);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("A program with this program code already exists");
            }
            throw new InternalServerError("Failed to create academic program");
        }
    }

    async getById(id: string): Promise<AcademicProgramDto> {
        const program = await this.academicProgramRepository.findById(id);

        if (!program) {
            throw new NotFoundError("Academic program not found");
        }

        return this.toDto(program);
    }

    async update(id: string, input: UpdateAcademicProgramInput): Promise<AcademicProgramDto> {
        await this.getById(id);

        try {
            const updated = await this.academicProgramRepository.update(id, input);
            return this.toDto(updated);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("Academic program with this program code cannot be updated");
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError("Academic program not found");
            }
            throw new InternalServerError("Failed to update academic program");
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.academicProgramRepository.delete(id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isForeignKeyConstraintViolation(error)) {
                throw new ConflictError("Failed to delete this program code");
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError("Academic program not found");
            }
            throw new InternalServerError("Failed to delete academic program");
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