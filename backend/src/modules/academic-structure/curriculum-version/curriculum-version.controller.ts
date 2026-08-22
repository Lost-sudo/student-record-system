import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { CurriculumVersionService } from "./curriculum-version.service.js";
import {
  createCurriculumVersionSchema,
  curriculumVersionQuerySchema,
  updateCurriculumVersionSchema,
} from "./curriculum-version.validator.js";
import { uuidParamsSchema } from "../../../utils/zod.js";

export class CurriculumVersionController {
  constructor(
    private readonly curriculumVersionService: CurriculumVersionService,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = createCurriculumVersionSchema.parse(req.body);
    const data = await this.curriculumVersionService.create(input);

    return res.status(201).json({
      success: true,
      message: "Curriculum version created successfully",
      data,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const data = await this.curriculumVersionService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Curriculum version fetched successfully",
      data,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const input = updateCurriculumVersionSchema.parse(req.body);
    const data = this.curriculumVersionService.update(id, input);

    return res.status(200).json({
      success: true,
      message: "Curriculum version updated successfully",
      data,
    });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    await this.curriculumVersionService.delete(id);

    return res.status(200).json({
      success: true,
      message: "Curriculum version deleted successfully",
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = curriculumVersionQuerySchema.parse(req.query);
    const result = await this.curriculumVersionService.list(query);

    return res.status(200).json({
      success: true,
      message: "Curriculum versions fetched successfully",
      data: result.items,
      pagination: result.meta,
    });
  });
}
