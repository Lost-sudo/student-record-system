import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { studentService } from "./student.service";

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    const studentData = req.body;

    const newStudent = await studentService.createStudent(studentData, userId);

    res.status(201).json({
        success: true,
        message: "Student creation successful",
        data: {
            student: newStudent,
        },
    });
});

export const getStudents = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const searchQuery = req.query.search as string | undefined;

    const result = await studentService.getStudents({ page, limit, searchQuery });

    res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        data: {
            students: result,
        }
    });
});

export const getStudentById = asyncHandler(async (req: Request, res: Response) => {
    const student = await studentService.getStudentById(req.params.id as string);

    res.status(200).json({
        success: true,
        message: "Student fetched successfully",
        data: {
            student: student,
        },
    });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
    const updatedStudent = await studentService.updateStudent(req.params.id as string, req.body);

    res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {
            student: updatedStudent,
        },
    });
});

export const softDeleteStudent = asyncHandler(async (req: Request, res: Response) => {
    const deletedStudent = await studentService.softDeleteStudent(req.params.id as string);

    res.status(200).json({
        success: true,
        message: "Student deleted successfully",
        data: {
            student: deletedStudent,
        },
    });
});

