import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { CourseService } from "./course.service";
import { courseQuerySchema, createCourseSchema, updateCourseSchema } from "./course.validator";
import { uuidParamsSchema } from "../../../utils/zod";

export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    create = asyncHandler(async (req: Request, res: Response) => {
        const input = createCourseSchema.parse(req.body);
        const data = await this.courseService.create(input);

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data,
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        const data = await this.courseService.getById(id);

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            data,
        });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        const input = updateCourseSchema.parse(req.body);
        const data = await this.courseService.update(id, input);

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data,
        });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        await this.courseService.delete(id);

        res.status(204).json({
            success: true,
            message: "Course deleted successfully",
        });
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const query = courseQuerySchema.parse(req.query);
        const result = await this.courseService.list(query);

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: result.items,
            meta: result.meta,
        });
    });
}