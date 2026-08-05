import { AcademicTerm } from '../../../generated/prisma/client';
import { AppError, BadRequestError, ConflictError, InternalServerError, NotFoundError } from '../../../utils/error.utils';
import { isForeignKeyConstraintViolation, isPrismaRecordNotFound, isUniqueConstraintViolation } from '../../../utils/prisma-error.utils';
import { PaginationMeta, buildPaginationMeta } from '../../../utils/pagination';
import { AcademicTermRepository } from "./academic-term.repository"
import { AcademicTermDto, AcademicTermQueryInput, CreateAcademicTermInput, UpdateAcademicTermInput } from "./academic-term.types";

export class AcademicTermService {
    constructor(private readonly academicTermRepository: AcademicTermRepository) { }

    async create(input: CreateAcademicTermInput): Promise<AcademicTermDto> {
        try {
            const term = await this.academicTermRepository.create(input);
            return this.toDto(term);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("A term with this term code already exist");
            }
            throw new InternalServerError("Failed to create academic term");
        }
    }

    async getById(id: string): Promise<AcademicTermDto> {
        const term = await this.academicTermRepository.findById(id);

        if (!term) {
            throw new NotFoundError('Academic term not found');
        }

        return this.toDto(term);
    }

    async update(id: string, input: UpdateAcademicTermInput): Promise<AcademicTermDto> {
        const existing = this.getById(id);

        const mergedStartDate = input.startDate ?? (await existing).startDate;
        const mergedEndDate = input.endDate ?? (await existing).endDate;

        if (mergedEndDate <= mergedStartDate) {
            throw new BadRequestError("End date must be after start date");
        }

        try {
            const updated = await this.academicTermRepository.update(id, input);
            return this.toDto(updated);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isUniqueConstraintViolation(error)) {
                throw new ConflictError("A term with this term code already exist");
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError('Academic term not found');
            }
            throw new InternalServerError("Failed to update academic term");
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.academicTermRepository.delete(id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (isForeignKeyConstraintViolation(error)) {
                throw new ConflictError('Failed to delete academic term');
            }
            if (isPrismaRecordNotFound(error)) {
                throw new NotFoundError('Academic term not found');
            }
            throw new InternalServerError('Failed to delete academic term');
        }
    }

    async list(query: AcademicTermQueryInput): Promise<{items: AcademicTermDto[]; meta: PaginationMeta}> {
        const { items, total } = await this.academicTermRepository.findMany(query);

        return {
            items: items.map((item) => this.toDto(item)),
            meta: buildPaginationMeta(query.page, query.limit, total),
        }
    }

    private toDto(model: AcademicTerm): AcademicTermDto {
        return {
            id: model.id,
            termCode: model.termCode,
            name: model.name,
            startDate: model.startDate,
            endDate: model.endDate,
            isActive: model.isActive,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        }
    }
}