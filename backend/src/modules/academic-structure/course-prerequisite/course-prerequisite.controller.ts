import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { CoursePrerequisiteService } from "./course-prerequisite.service.js";
import {
  coursePrerequisiteQuerySchema,
  createCoursePrerequisiteSchema,
} from "./course-prerequisite.validator.js";
import { uuidParamsSchema } from "../../../utils/zod.js";

export class CoursePrerequisiteController {
  constructor(
    private readonly coursePrerequisiteService: CoursePrerequisiteService,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = createCoursePrerequisiteSchema.parse(req.body);
    const data = await this.coursePrerequisiteService.create(input);

    return res.status(201).json({
      success: true,
      message: "Course Prerequisite created successfully",
      data,
    });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    await this.coursePrerequisiteService.delete(id);

    return res.status(204).json({
      success: true,
      message: "Course Prerequisite deleted successfully",
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = coursePrerequisiteQuerySchema.parse(req.query);
    const result = await this.coursePrerequisiteService.list(query);

    return res.status(200).json({
      success: true,
      message: "Course Prerequisites fetched successfully",
      data: result.items,
      meta: result.meta,
    });
  });
}
