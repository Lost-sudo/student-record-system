import { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { AcademicTermService } from "./academic-term.service";
import { academicTermQuerySchema, createAcademicTermSchema, updateAcademicTermSchema } from "./academic-term.validator";
import { uuidParamsSchema } from "../../../utils/zod";

export class AcademicTermController {
    constructor(private readonly academicTermService: AcademicTermService) { }

    create = asyncHandler(async (req: Request, res: Response) => {
        const input = createAcademicTermSchema.parse(req.body);
        const data = await this.academicTermService.create(input);

        return res.status(201).json({
            success: true,
            message: "Academic term created successfully",
            data,
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        const data = await this.academicTermService.getById(id);

        return res.status(200).json({
            success: true,
            message: "Academic term fetched successfully",
            data
        });
    })

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params)
        const input = updateAcademicTermSchema.parse(req.body);
        const data = await this.academicTermService.update(id, input);

        return res.status(200).json({
            success: true,
            message: "Academic term updated successfully",
            data,
        });
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const query = academicTermQuerySchema.parse(req.query);
        const result = await this.academicTermService.list(query);

        return res.status(200).json({
            success: true,
            message: "Academic terms fetched successfully",
            data: result.items,
            meta: result.meta
        })
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        await this.academicTermService.delete(id);

        return res.status(204).json({
            success: true,
            message: "Academic term deleted successfully"
        });
    });
}