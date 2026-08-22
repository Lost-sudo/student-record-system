import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../utils/error.utils.js";
import { AcademicTermRepository } from "./academic-term.repository.js";
import { AcademicTermService } from "./academic-term.service.js";
import { CreateAcademicTermInput, UpdateAcademicTermInput } from "./academic-term.types.js";

jest.mock("../../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

const mockAcademicTermRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
}

describe('Academic Service', () => {
    let service: AcademicTermService;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const validStartDate = new Date('2026-08-01T00:00:00.000Z');
    const validEndDate = new Date('2026-12-15T00:00:00.000Z');

    const mockTerm = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        termCode: 'FALL-2026',
        name: 'Fall 2026',
        startDate: validStartDate,
        endDate: validEndDate,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    const createInput: CreateAcademicTermInput = {
        termCode: 'FALL-2026',
        name: 'Fall 2026',
        startDate: validStartDate,
        endDate: validEndDate,
        isActive: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AcademicTermService(mockAcademicTermRepository as unknown as AcademicTermRepository);
    });

    describe('create', () => {
        it('should successfully create an academic term and return a DTO', async () => {
            mockAcademicTermRepository.create.mockResolvedValue(mockTerm);

            const result = await service.create(createInput);

            expect(mockAcademicTermRepository.create).toHaveBeenCalledWith(createInput);
            expect(result.id).toBe(mockTerm.id);
            expect(result.termCode).toBe('FALL-2026');
            expect(result.startDate).toEqual(validStartDate);
        });

        it('should throw ConflictError if term code already exist', async () => {
            mockAcademicTermRepository.create.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('A term with this term code already exist');
        });

        it('should throw InternalServerError if the repository throws a database error', async () => {
            mockAcademicTermRepository.create.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to create academic term');
        });
    });

    describe('getById', () => {
        it('should return a term DTO when found', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            const result = await service.getById(mockTerm.id);

            expect(mockAcademicTermRepository.findById).toHaveBeenCalledWith(mockTerm.id);
            expect(result.id).toBe(mockTerm.id);
        });

        it('should throw NotFoundError if term does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            const promise = service.getById('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic term not found');
        });
    });

    describe('update', () => {
        it('should successfully update a term and return the updated DTO', async () => {
            const updateInput: UpdateAcademicTermInput = { name: 'Updated Fall 2026' };
            const updatedTerm = { ...mockTerm, name: updateInput.name };

            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.update.mockResolvedValue(updatedTerm);

            const result = await service.update(mockTerm.id, updateInput);

            expect(mockAcademicTermRepository.update).toHaveBeenCalledWith(mockTerm.id, updateInput);
            expect(result.name).toBe('Updated Fall 2026');
        });

        it('should throw NotFoundError if the term to update does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            const promise = service.update('non-existent-id', { name: 'New Name' });
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic term not found');
        });

        it('should throw BadRequestError if updated startDate is after existing endDate', async () => {
            const invalidUpdate: UpdateAcademicTermInput = {
                startDate: new Date('2027-01-01T00:00:00.000Z')
            };

            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            const promise = service.update(mockTerm.id, invalidUpdate);
            await expect(promise).rejects.toThrow(BadRequestError);
            await expect(promise).rejects.toThrow('End date must be after start date');
        });

        it('should throw BadRequestError if both updated dates are invalid (end <= start)', async () => {
            const invalidUpdate: UpdateAcademicTermInput = {
                startDate: new Date('2026-12-01T00:00:00.000Z'),
                endDate: new Date('2026-08-01T00:00:00.000Z')
            };

            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            const promise = service.update(mockTerm.id, invalidUpdate);
            await expect(promise).rejects.toThrow(BadRequestError);
            await expect(promise).rejects.toThrow('End date must be after start date');
        });

        it('should throw ConflictError if the updated code violates unique constraint', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.update.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

            const promise = service.update(mockTerm.id, { termCode: 'EXISTING-CODE' });
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('A term with this term code already exist');
        });

        it('should throw NotFoundError if the term is removed concurrently (P2025)', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.update.mockRejectedValue({ code: 'P2025' });

            const promise = service.update(mockTerm.id, { termCode: 'EXISTING-CODE' });
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic term not found');
        });

        it('should throw InternalServerError if the repository throws a database error on update', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.update.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.update(mockTerm.id, { name: 'New Name' });
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to update academic term');
        });
    });

    describe('delete', () => {
        it('should successfully delete a term', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.delete.mockResolvedValue(mockTerm);

            await service.delete(mockTerm.id);

            expect(mockAcademicTermRepository.delete).toHaveBeenCalledWith(mockTerm.id);
        });

        it('should throw NotFoundError if the term to delete does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            const promise = service.delete('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic term not found');
        });

        it('should throw ConflictError if the term is referenced elsewhere (P2003)', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.delete.mockRejectedValue({ code: 'P2003' });

            const promise = service.delete(mockTerm.id);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('Failed to delete academic term');
        });

        it('should throw InternalServerError if the repository throws an error', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.delete.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.delete(mockTerm.id);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to delete academic term');
        });
    });

    describe('list', () => {
        it('should return a paginated list of DTOs and metadata', async () => {
            const query = {
                page: 1,
                limit: 10,
                sortBy: 'createdAt' as const,
                sortOrder: 'desc' as const,
            };

            mockAcademicTermRepository.findMany.mockResolvedValue({
                items: [mockTerm],
                total: 1,
            });

            const result = await service.list(query);

            expect(mockAcademicTermRepository.findMany).toHaveBeenCalledWith(query);
            expect(result.items).toHaveLength(1);
            expect(result.items[0].termCode).toBe('FALL-2026');

            expect(result.meta).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            });
        });
    });
})
