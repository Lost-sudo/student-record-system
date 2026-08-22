import { AcademicProgramService } from './academic-program.service.js';
import { AcademicProgramRepository } from './academic-program.repository.js';
import { ConflictError, InternalServerError, NotFoundError } from '../../../utils/error.utils.js';
import { CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.validator.js';

jest.mock("../../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

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

        it('should throw ConflictError if a program code already exists', async () => {
            mockAcademicProgramRepository.create.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('A program with this program code already exists');
        });

        it('should throw InternalServerError if the repository throws a database error', async () => {
            mockAcademicProgramRepository.create.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to create academic program');
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

        it('should throw NotFoundError if program does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            const promise = service.getById('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic program not found');
        });
    });

    describe('update', () => {
        it('should successfully update a program and return the updated DTO', async () => {
            const updatedProgram = { ...mockProgram, name: updateInput.name };

            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockResolvedValue(updatedProgram);

            const result = await service.update(mockProgram.id, updateInput);

            expect(mockAcademicProgramRepository.findById).toHaveBeenCalledWith(mockProgram.id);
            expect(mockAcademicProgramRepository.update).toHaveBeenCalledWith(mockProgram.id, updateInput);
            expect(result.name).toBe('Updated CS Program Name');
        });

        it('should throw NotFoundError if the program to update does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            const promise = service.update('non-existent-id', updateInput);
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic program not found');
        });

        it('should throw ConflictError if the updated code violates unique constraint', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

            const promise = service.update(mockProgram.id, { programCode: 'EXISTING-CODE' });
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('Academic program with this program code cannot be updated');
        });

        it('should throw NotFoundError if the program is removed concurrently (P2025)', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockRejectedValue({ code: 'P2025' });

            const promise = service.update(mockProgram.id, { programCode: 'EXISTING-CODE' });
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic program not found');
        });

        it('should throw InternalServerError if the repository throws a database error on update', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.update.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.update(mockProgram.id, updateInput);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to update academic program');
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

        it('should throw NotFoundError if the program to delete does not exist', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(null);

            const promise = service.delete('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Academic program not found');
        });

        it('should throw ConflictError if the program failed to delete due to conflicts in relational dependencies', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.delete.mockRejectedValue({ code: 'P2003', message: 'Foreign key constraint failed' });

            const promise = service.delete(mockProgram.id);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('Failed to delete this program code');
        });

        it('should throw InternalServerError if the repository throws an error', async () => {
            mockAcademicProgramRepository.findById.mockResolvedValue(mockProgram);
            mockAcademicProgramRepository.delete.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.delete(mockProgram.id);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to delete academic program');
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
