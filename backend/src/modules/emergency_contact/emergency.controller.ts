import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { emergencyContactService } from "./emergency.service";

export const createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { name, relationship, phone, email, isPrimary } = req.body;
    const { studentId } = req.params;

    const result = await emergencyContactService.createEmergencyContact(studentId as string, { name, relationship, phone, email, isPrimary });

    res.status(201).json({
        success: true,
        message: "Emergency contact created successfully",
        data: {
            emergencyContact: result,
        },
    });
});

export const getEmergencyContactByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;

    const result = await emergencyContactService.getContactByStudentId(studentId as string);

    res.status(200).json({
        success: true,
        message: "Student emergency contacts fetched successfully",
        data: {
            emergencyContact: result,
        },
    });
});

export const updateEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateEmergencyContactData = req.body;

    const updatedEmergencyContact = await emergencyContactService.updateEmergencyContact(id as string, updateEmergencyContactData);

    res.status(200).json({
        success: true,
        message: "Emergency contact updated successfully",
        data: {
            emergencyContact: updatedEmergencyContact,
        }
    });
});

export const deleteEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedEmergencyContact = await emergencyContactService.deleteEmergencyContact(id as string);

    res.status(200).json({
        success: true,
        message: "Emergency contact deleted successfully",
        data: {
            emergencyContact: deletedEmergencyContact,
        }
    });
});