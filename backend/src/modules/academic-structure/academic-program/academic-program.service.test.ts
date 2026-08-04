import { Prisma } from "../../../generated/prisma/client";
import { AcademicProgramService } from './academic-program.service';
import { AcademicProgramRepository } from './academic-program.repository';
import { AppError } from '../../../middlewares/error.middleware';
import { CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.validator';

const mockAcademicProgramRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
};

describe("Academic Program Service", () => {
    let service: AcademicProgramService;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const mockProgram = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        programCode: 'BS-CS',
        name: 'Bachelor of Science in Computer Science',
        degreeType: 'BACHELOR' as const,
        description: 'Comprehensive CS program',
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
    }

    const createInput: CreateAcademicProgramInput = {
        programCode: 'BS-CS',
        name: 'Bachelor of Science in Computer Science',
        degreeType: 'BACHELOR',
        description: 'Comprehensive CS program',
        isActive: true
    };

    const updateInput: UpdateAcademicProgramInput = {
        name: 'Updated CS Program Name'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AcademicProgramService(mockAcademicProgramRepository as unknown as AcademicProgramRepository);
    });

    describe('create', () => {
        it('should successfully create an academic program and return a DTO', async () => {
            mockAcademicProgramRepository.create.mockResolvedValue(mockProgram);

            const result = await service.create(createInput);

            expect(mockAcademicProgramRepository.create).toHaveBeenCalledWith(createInput);
            expect(result).toEqual({
                id: mockProgram.id,
                programCode: mockProgram.programCode,
                name: mockProgram.name,
                degreeType: mockProgram.degreeType,
                description: mockProgram.description,
                isActive: mockProgram.isActive,
                createdAt: mockProgram.createdAt,
                updatedAt: mockProgram.updatedAt,
            });
        });

        it('should throw a 409 Conflict error if a program code already exists', async () => {
            mockAcademicProgramRepository.create.mockRejectedValue(AppError);

            await expect(service.create(createInput)).rejects.toThrow(AppError);

            try {
                await service.create(createInput);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AppError);
                expect(error.statusCode).toBe(409);
                expect(error.message).toBe('A program with this program code already exists')
            }
        });
    });

    describe('getById', () => {
        it('should return a program DTO when found', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);

            const result = await service.getById(mockProgram.id);

            expect(mockAcademicProgramRepository.findById).toHaveBeenCalledWith(mockProgram.id);
            expect(result.id).toBe(mockProgram.id);
            expect(result.programCode).toBe('BS-CS');
        });

        it('should throw a 404 Not Found error if program does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            await expect(service.getById('non-existent-id')).rejects.toThrow(AppError);

            try {
                await service.getById('non-existent-id');
            } catch (error: any) {
                expect(error.statusCode).toBe(404);
                expect(error).toBeInstanceOf(AppError);
                expect(error.message).toBe('Academic program not found');
            }
        });
    });

    describe('update', () => {
        it('should successfully updae a program and return the updated DTO', async () => {
            const updatedProgram = { ...mockProgram, name: updateInput.name };

            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockResolvedValue(updatedProgram);

            const result = await service.update(mockProgram.id, updateInput);

            expect(mockAcademicProgramRepository.findById).toHaveBeenCalledWith(mockProgram.id);
            expect(mockAcademicProgramRepository.update).toHaveBeenCalledWith(mockProgram.id, updateInput);
            expect(result.name).toBe('Updated CS Program Name');
        });

        it('should throw 404 Not Found if the program to update does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            await expect(service.update('non-existent-id', updateInput)).rejects.toThrow(AppError);
        });

        it('should throw 409 Conflict if the updated code violates unique constraint', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockRejectedValue(AppError);

            await expect(service.update(mockProgram.id, { programCode: 'EXISTING-CODE' })).rejects.toThrow(AppError);

            try {
                await service.update(mockProgram.id, { programCode: 'EXISTING-CODE' });
            } catch (error: any) {
                expect(error.statusCode).toBe(409);
                expect(error.message).toBe('Academic program with this program code cannot be updated');
            }
        });
    });

    describe('delete', () => {
        it('should successfully delete a program', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.delete.mockResolvedValue(mockProgram);

            await service.delete(mockProgram.id);

            expect(mockAcademicProgramRepository.findById).toHaveBeenCalledWith(mockProgram.id);
            expect(mockAcademicProgramRepository.delete).toHaveBeenCalledWith(mockProgram.id);
        });

        it('should throw 404 Not Found if the program to delete does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);
        });

        it('should throw a 409 Conflict if the program failed to delete due to conflicts in relational dependencies', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.delete.mockRejectedValue(AppError);

            await expect(service.delete(mockProgram.id)).rejects.toThrow(AppError);

            try {
                await service.delete(mockProgram.id);
            } catch (error: any) {
                expect(error.statusCode).toBe(409);
                expect(error.message).toBe("Failed to delete this program code")
            }
        })
    });

    describe('list', () => {
        it('should return a paginated list of DTOs and metadata', async () => {
            const query = {
                page: 1,
                limit: 10,
                sortBy: 'createdAt' as const,
                sortOrder: 'desc' as const,
            };

            mockAcademicProgramRepository.findMany.mockResolvedValue({
                items: [mockProgram],
                total: 1,
            });

            const result = await service.list(query);

            expect(mockAcademicProgramRepository.findMany).toHaveBeenCalledWith(query);

            expect(result.items).toHaveLength(1);
            expect(result.items[0].id).toBe(mockProgram.id);

            expect(result.meta).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1
            });
        });

        it('should correctly calculate total pages in metadata', async () => {
            const query = {
                page: 1,
                limit: 10,
                sortBy: 'createdAt' as const,
                sortOrder: 'desc' as const,
            };

            mockAcademicProgramRepository.findMany.mockResolvedValue({
                items: [],
                total: 25,
            });

            const result = await service.list(query);

            expect(result.items).toHaveLength(0);
            expect(result.meta.total).toBe(25);
            expect(result.meta.totalPages).toBe(3);
        })
    })
})