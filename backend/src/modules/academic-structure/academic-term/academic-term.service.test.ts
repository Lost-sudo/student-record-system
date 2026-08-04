import { util } from "zod";
import { AppError } from "../../../middlewares/error.middleware";
import { AcademicTermRepository } from "./academic-term.repository";
import { AcademicTermService } from "./academic-term.service";
import { CreateAcademicTermInput, UpdateAcademicTermInput } from "./academic-term.types";

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

        it('should throw a 409 Conflict error if term code already exist', async () => {
            mockAcademicTermRepository.create.mockRejectedValue(AppError);

            await expect(service.create(createInput)).rejects.toThrow(AppError);

            try {
                await service.create(createInput);
            } catch (error: any) {
                expect(error.statusCode).toBe(409);
                expect(error.message).toBe('A term with this term code already exist');
            }
        });
    });

    describe('getById', () => {
        it('should return a term DTO when found', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            const result = await service.getById(mockTerm.id);

            expect(mockAcademicTermRepository.findById).toHaveBeenCalledWith(mockTerm.id);
            expect(result.id).toBe(mockTerm.id);
        });

        it('should throw 404 Not Found error if term does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            await expect(service.getById('non-existent-id')).rejects.toThrow(AppError);

            try {
                await service.getById('non-existing-id');
            } catch (error: any) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Academic term not found');
            }
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

        it('should throw 404 Not Found if the term to update does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            await expect(service.update('non-existent-id', { name: 'New Name' })).rejects.toThrow(AppError);
        });

        it('should throw 400 Bad Request if updated startDate is after existing endDate', async () => {
            const invalidUpdate: UpdateAcademicTermInput = {
                startDate: new Date('2027-01-01T00:00:00.000Z')
            };

            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            await expect(service.update(mockTerm.id, invalidUpdate)).rejects.toThrow(AppError);

            try {
                await service.update(mockTerm.id, invalidUpdate);
            } catch (error: any) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('End date must be after start date');
            }
        });

        it('should throw 400 Bad Request if both updated dates are invalid (end <= start)', async () => {
            const invalidUpdate: UpdateAcademicTermInput = {
                startDate: new Date('2026-12-01T00:00:00.000Z'),
                endDate: new Date('2026-08-01T00:00:00.000Z')
            };

            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);

            await expect(service.update(mockTerm.id, invalidUpdate)).rejects.toThrow(AppError);
        });

        it('should throw 500 if the updated code violates unique constraint', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.update.mockRejectedValue(AppError);

            await expect(service.update(mockTerm.id, { termCode: 'EXISTING-CODE' })).rejects.toThrow(AppError);

            try {
                await service.update(mockTerm.id, { termCode: 'EXISTING-CODE' });
            } catch (error: any) {
                expect(error.statusCode).toBe(500);
                expect(error.message).toBe('Failed to update academic term')
            }
        });
    });

    describe('delete', () => {
        it('should successfully delete a term', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(mockTerm);
            mockAcademicTermRepository.delete.mockResolvedValue(mockTerm);

            await service.delete(mockTerm.id);

            expect(mockAcademicTermRepository.delete).toHaveBeenCalledWith(mockTerm.id);
        });

        it('should throw 404 Not Found if the term to delete does not exist', async () => {
            mockAcademicTermRepository.findById.mockResolvedValue(null);

            await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);
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