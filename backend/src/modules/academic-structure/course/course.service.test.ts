import { mock } from "node:test";
import { AppError } from "../../../middlewares/error.middleware";
import { CourseRepository } from "./course.repository";
import { CourseService } from "./course.service";
import { CreateCourseInput, UpdateCourseInput } from "./course.types";

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

        it('should throw a 409 Conflict error if repository returns null/undefined', async () => {
            mockCourseRepository.create.mockResolvedValue(null);

            await expect(service.create(createInput)).rejects.toThrow(AppError);

            try {
                await service.create(createInput);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AppError);
                expect(error.message).toBe('A course with this course already exist');
                expect(error.statusCode).toBe(409);
            }
        });

        it('should throw a generic 500 AppError if the repository throws a database error', async () => {
            mockCourseRepository.create.mockRejectedValue(AppError);

            await expect(service.create).rejects.toThrow(AppError);

            try {
                await service.create(createInput);
            } catch (error: any) {
                expect(error).toBeInstanceOf(AppError);
                expect(error.message).toBe('There is an error creating a course');
                expect(error.statusCode).toBe(500);
            }
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

        it('should throw 404 Not Found error if course does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            await expect(service.getById('non-existent-id')).rejects.toThrow(AppError);

            try {
                await service.getById('non-existent-id');
            } catch (error: any) {
                expect(error).toBeInstanceOf(AppError);
                expect(error.message).toBe('Course not found');
                expect(error.statusCode).toBe(404);
            }
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

        it('should throw 404 Not Found error if course to update does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            await expect(service.update('non-existent-id', updateInput)).rejects.toThrow(AppError);

            try {
                await service.update('non-existent-id', updateInput);
            } catch (error: any) {
                expect(error.statusCode).toBe(404);
                expect(error.message).toBe('Course not found')
            }
        });

        it('should throw 404 Bad Request error if repository return null/undefined on update', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockResolvedValue(null);

            await expect(service.update(mockCourse.id, updateInput)).rejects.toThrow(AppError);

            try {
                await service.update(mockCourse.id, updateInput);
            } catch (error: any) {
                expect(error.statusCode).toBe(400);
                expect(error.message).toBe('Failed to update course ');
            }
        });

        it('should throw generic 500 AppError if the repository  throws a database error on update', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.update.mockRejectedValue(AppError);

            await expect(service.update(mockCourse.id, updateInput)).rejects.toThrow(AppError);

            try {
                await service.update(mockCourse.id, updateInput);
            } catch (error: any) {
                expect(error.statusCode).toBe(500);
                expect(error.message).toBe('There is an error updating the course')
            }
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

        it('should throw 404 AppError if the course to delete does not exist', async () => {
            mockCourseRepository.findById.mockResolvedValue(null);

            await expect(service.delete('non-existent-id')).rejects.toThrow(AppError);
        });

        it('should throw a generic 500 AppError if the repository throws an error', async () => {
            mockCourseRepository.findById.mockResolvedValue(mockCourse);
            mockCourseRepository.delete.mockRejectedValue(AppError);

            await expect(service.delete(mockCourse.id)).rejects.toThrow(AppError);

            try {
                await service.delete(mockCourse.id);
            } catch (error: any) {
                expect(error.statusCode).toBe(500);
                expect(error.message).toBe('Failed to delete course');
            }
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