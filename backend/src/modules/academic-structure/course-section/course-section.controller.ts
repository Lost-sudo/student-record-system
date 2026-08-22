import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { CourseSectionService } from "./course-section.service.js";
import {
  courseSectionQuerySchema,
  createCourseSectionSchema,
  updateCourseSectionSchema,
} from "./course-section.validator.js";
import { uuidParamsSchema } from "../../../utils/zod.js";

export class CourseSectionController {
  constructor(private readonly courseSectionService: CourseSectionService) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = createCourseSectionSchema.parse(req.body);
    const data = await this.courseSectionService.create(input);

    return res.status(201).json({
      success: true,
      message: "Course section successfully created",
      data,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const data = await this.courseSectionService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Course section successfully fetched",
      data,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const input = updateCourseSectionSchema.parse(req.body);
    const data = await this.courseSectionService.update(id, input);

    return res.status(200).json({
      success: true,
      message: "Course section updated successfully",
      data,
    });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    await this.courseSectionService.delete(id);

    return res.status(204).json({
      success: true,
      message: "Course section removed successfully",
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = courseSectionQuerySchema.parse(req.query);
    const result = await this.courseSectionService.list(query);

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  });
}
