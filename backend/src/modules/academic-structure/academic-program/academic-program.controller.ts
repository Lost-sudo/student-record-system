import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler';
import { AcademicProgramService } from './academic-program.service';
import { academicProgramQuerySchema, createAcademicProgramSchema, updateAcademicProgramSchema } from './academic-program.validator';
import { uuidParamsSchema } from '../../../utils/zod';
import { th } from 'zod/v4/locales/index.js';

export class AcademicProgramController {
    constructor(private readonly academicProgramService: AcademicProgramService) {}

    create = asyncHandler(async (req: Request, res: Response) => {
        const input = createAcademicProgramSchema.parse(req.body);
        const data = await this.academicProgramService.create(input);

        return res.status(201).json({
            success: true,
            message: "Academic program created successfully",
            data
        });
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        const data = await this.academicProgramService.getById(id);

        return res.status(200).json({
            success: true,
            message: "Academic program fetched successfully",
            data
        });
    });

    update = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        const input = updateAcademicProgramSchema.parse(req.body);
        const data = await this.academicProgramService.update(id, input);

        return res.status(200).json({
            success: true,
            message: "Academic program updated successfully",
            data,
        });
    });

    remove = asyncHandler(async (req: Request, res: Response) => {
        const { id } = uuidParamsSchema.parse(req.params);
        await this.academicProgramService.delete(id);

        return res.status(200).json({
            success: true,
            message: "Academic program deleted successfully"
        });
    });

    list = asyncHandler(async (req: Request, res: Response) => {
        const query = academicProgramQuerySchema.parse(req.query);
        const result = await this.academicProgramService.list(query);

        return res.status(200).json({
            success: true,
            message: "Academic programs fetched successfully",
            data: result.items,
            meta: result.meta
        })
    })
}
