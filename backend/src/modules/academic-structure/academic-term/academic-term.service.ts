import { AcademicTerm } from '../../../generated/prisma/client';
import { AppError } from '../../../middlewares/error.middleware';
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
            throw new AppError("A term with this term code already exist", 409);
        }
    }

    async getById(id: string): Promise<AcademicTermDto> {
        const term = await this.academicTermRepository.findById(id);

        if (!term) {
            throw new AppError('Academic term not found', 404);
        }

        return this.toDto(term);
    }

    async update(id: string, input: UpdateAcademicTermInput): Promise<AcademicTermDto> {
        const existing = this.getById(id);

        const mergedStartDate = input.startDate ?? (await existing).startDate;
        const mergedEndDate = input.endDate ?? (await existing).endDate;

        if (mergedEndDate <= mergedStartDate) {
            throw new AppError("End date must be after start date", 400);
        }

        try {
            const updated = await this.academicTermRepository.update(id, input);
            return this.toDto(updated);
        } catch (error) {
            throw new AppError("Failed to update academic term", 500);
        }
    }

    async delete(id: string): Promise<void> {
        await this.getById(id);

        try {
            await this.academicTermRepository.delete(id);
        } catch (error) {
            throw new AppError('Failed to delete academic term', 400);
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