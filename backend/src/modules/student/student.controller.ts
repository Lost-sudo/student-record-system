import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { uuidParamsSchema } from "../../utils/zod";
import { studentQuerySchema, createStudentSchema, updateStudentSchema } from "./student.validator";
import { StudentService } from "./student.service";

export class StudentController {
  constructor(private readonly service: StudentService) {}

  createStudent = asyncHandler(async (req: Request, res: Response) => {
    const input = createStudentSchema.parse(req.body);
    const data = await this.service.create(input, input.userId);

    return res.status(201).json({
      success: true,
      message: "Student creation successful",
      data,
    });
  });

  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const query = studentQuerySchema.parse(req.query);
    const result = await this.service.list(query);

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      data: result.items,
      meta: result.meta,
    });
  });

  getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const student = await this.service.getById(id);

    return res.status(200).json({
      success: true,
      message: "Student fetched successfully",
      data: student,
    });
  });

  updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const input = updateStudentSchema.parse(req.body);
    const updatedStudent = await this.service.update(id, input);

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  });

  softDeleteStudent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    await this.service.delete(id);

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  });
}
