import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { DegreeRequirementService } from "./degree-requirement.service";
import {
  createDegreeRequirementSchema,
  degreeRequirementQuerySchema,
  updateDegreeRequirementSchema,
} from "./degree-requirement.validator";
import { uuidParamsSchema } from "../../utils/zod";

export class DegreeRequirementController {
  constructor(
    private readonly degreeRequirementService: DegreeRequirementService,
  ) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = createDegreeRequirementSchema.parse(req.body);
    const data = await this.degreeRequirementService.create(input);

    return res.status(201).json({
      success: true,
      message: "Degree requirement created successfully",
      data,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const data = await this.degreeRequirementService.getById(id);

    return res.status(200).json({
      success: true,
      message: "Degree requirement fetched successfully",
      data,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const input = updateDegreeRequirementSchema.parse(req.body);
    const data = this.degreeRequirementService.update(id, input);

    return res.status(200).json({
      success: true,
      message: "Degree requirement updated successfully",
      data,
    });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    await this.degreeRequirementService.delete(id);

    return res.status(204).json({
      success: true,
      message: "Degree requirement removed successfully",
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = degreeRequirementQuerySchema.parse(req.query);
    const result = await this.degreeRequirementService.list(query);

    return res.status(200).json({
      success: true,
      message: "Degree requirements fetched successfully",
      data: result.items,
      meta: result.meta,
    });
  });
}
