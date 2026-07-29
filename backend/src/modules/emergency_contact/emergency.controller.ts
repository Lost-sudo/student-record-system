import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {emergencyContactService} from "./emergency.service";

export const createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { name, relationship, phone, email, isPrimary } = req.body;
    const studentId = req.params.studentId as string;

    const result = await emergencyContactService.createEmergencyContact(studentId, { name, relationship, phone, email, isPrimary });

    res.status(201).json({
        success: true,
        message: "Emergency contact created successfully",
        data: {
            emergencyContact: result,
        },
    });
});

export const getEmergencyContactByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.params.studentId as string;

    const result = await emergencyContactService.getContactByStudentId(studentId);

    res.status(200).json({
        success: true,
        message: "Emergency contacts fetched successfully",
        data: {
            emergencyContact: result,
        },
    });
});

export const updateEmergencyContact = asyncHandler(async (req: Request, res: Response)=> {
    const { studentId } = req.params;
    const updateEmergencyContactData = req.body;

    const updatedEmergencyContact = await emergencyContactService.updateEmergencyContact(studentId as string, updateEmergencyContactData);

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