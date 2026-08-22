import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from "../../../utils/error.utils.js";
import { CourseRepository } from "./course.repository.js";
import { CourseService } from "./course.service.js";
import { CreateCourseInput, UpdateCourseInput } from "./course.types.js";

jest.mock("../../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

const mockCourseRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
};

describe('CourseService', () => {
    let service: CourseService;

    const mockDate = new Date('2026-01-01T00:00:00.000Z');
    const mockCourse = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Basic programming concepts',
        defaultCredits: 3,
        isActive: true,
        createdAt: mockDate,
        updatedAt: mockDate,
    };

    const createInput: CreateCourseInput = {
        courseCode: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Basic programming concepts',
        defaultCredits: 3,
        isActive: true,
    };

    const updateInput: UpdateCourseInput = {
        title: 'Updated CS101 Title',
    };

    beforeEach(() => {
        jest.clearAllMocks();

        service = new CourseService(mockCourseRepository as unknown as CourseRepository);
    });

    describe('create', () => {
        it('should create a course and return a DTO', async () => {
            mockCourseRepository.create.mockResolvedValue(mockCourse);

            const result = await service.create(createInput);

            expect(mockCourseRepository.create).toHaveBeenCalledWith(createInput);
            expect(result).toEqual({
                id: mockCourse.id,
                courseCode: mockCourse.courseCode,
                title: mockCourse.title,
                description: mockCourse.description,
                defaultCredits: mockCourse.defaultCredits,
                isActive: mockCourse.isActive,
                createdAt: mockCourse.createdAt,
                updatedAt: mockCourse.updatedAt,
            });
        });

        it('should throw ConflictError if repository returns null/undefined', async () => {
            mockCourseRepository.create.mockResolvedValue(null);

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('A course with this course already exist');
        });

        it('should throw ConflictError if a unique constraint violation occurs', async () => {
            mockCourseRepository.create.mockRejectedValue({ code: 'P2002' });

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('A course with this course already exist');
        });

        it('should throw InternalServerError if the repository throws a database error', async () => {
            mockCourseRepository.create.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.create(createInput);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('There is an error creating a course');
        });
    });

    describe('getById', () => {
        it('should return a course DTO when found', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);

            const result = await service.getById(mockCourse.id);

            expect(mockCourseRepository.findById).toHaveBeenCalledWith(mockCourse.id);
            expect(result.id).toBe(mockCourse.id);
            expect(result.courseCode).toBe('CS101');
        });

        it('should throw NotFoundError if course does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            const promise = service.getById('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Course not found');
        });
    });

    describe('update', () => {
        it('should successfully update course and return the updated course DTO', async () => {
            const updatedCourse = { ...mockCourse, title: updateInput.title };

            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockResolvedValue(updatedCourse);

            const result = await service.update(mockCourse.id, updateInput);

            expect(mockCourseRepository.findById).toHaveBeenCalledWith(mockCourse.id);
            expect(mockCourseRepository.update).toHaveBeenCalledWith(mockCourse.id, updateInput);
            expect(result.title).toBe('Updated CS101 Title')
        });

        it('should throw NotFoundError if course to update does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            const promise = service.update('non-existent-id', updateInput);
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Course not found');
        });

        it('should throw BadRequestError if repository returns null/undefined on update', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockResolvedValue(null);

            const promise = service.update(mockCourse.id, updateInput);
            await expect(promise).rejects.toThrow(BadRequestError);
            await expect(promise).rejects.toThrow('Failed to update course ');
        });

        it('should throw NotFoundError if the course is removed concurrently (P2025)', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockRejectedValue({ code: 'P2025' });

            const promise = service.update(mockCourse.id, updateInput);
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Course not found');
        });

        it('should throw InternalServerError if the repository throws a database error on update', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.update(mockCourse.id, updateInput);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('There is an error updating the course')
        });
    });

    describe('delete', () => {
        it('should successfully delete a course', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.delete.mockResolvedValue(mockCourse);

            await service.delete(mockCourse.id);

            expect(mockCourseRepository.findById).toHaveBeenCalledWith(mockCourse.id);
            expect(mockCourseRepository.delete).toHaveBeenCalledWith(mockCourse.id);
        });

        it('should throw NotFoundError if the course to delete does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            const promise = service.delete('non-existent-id');
            await expect(promise).rejects.toThrow(NotFoundError);
            await expect(promise).rejects.toThrow('Course not found');
        });

        it('should throw ConflictError if the course is referenced elsewhere (P2003)', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.delete.mockRejectedValue({ code: 'P2003' });

            const promise = service.delete(mockCourse.id);
            await expect(promise).rejects.toThrow(ConflictError);
            await expect(promise).rejects.toThrow('Failed to delete course');
        });

        it('should throw InternalServerError if the repository throws an error', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.delete.mockRejectedValue(new Error('Database connection lost'));

            const promise = service.delete(mockCourse.id);
            await expect(promise).rejects.toThrow(InternalServerError);
            await expect(promise).rejects.toThrow('Failed to delete course');
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

            mockCourseRepository.findMany.mockResolvedValue({
                items: [mockCourse],
                total: 1,
            });

            const result = await service.list(query);

            expect(mockCourseRepository.findMany).toHaveBeenCalledWith(query);

            expect(result.items).toHaveLength(1);
            expect(result.items[0].id).toBe(mockCourse.id);

            expect(result.meta).toEqual({
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
            });
        });

        it('should correctly calculate total pages in metadata for multiple pages', async () => {
            const query = { page: 2, limit: 10, sortBy: 'createdAt' as const, sortOrder: 'desc' as const };

            mockCourseRepository.findMany.mockResolvedValue({
                items: [],
                total: 45,
            });

            const result = await service.list(query);

            expect(result.items).toHaveLength(0);
            expect(result.meta.total).toBe(45);
            expect(result.meta.totalPages).toBe(5);
            expect(result.meta.page).toBe(2);
        });
    });
})
