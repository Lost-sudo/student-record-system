import {Request, Response} from "express";
import {contactService} from "./contact.service";
import {AppError} from "../../middlewares/error.middleware";
import {asyncHandler} from "../../utils/asyncHandler";

export const getContactInfoByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const contactInfo = await contactService.getContactInfoByStudentId(studentId as string);

    res.status(200).json({
        success: true,
        message: "Student contact information fetched successfully",
        data: {
            contactInfo: contactInfo,
        }
    })
});

export const createContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const contactData = req.body;

    const newContactInfo = await contactService.createContactInfo(studentId as string, contactData);
    res.status(201).json({
        success: true,
        message: "Contact created successfully",
        data: {
            contactInfo: newContactInfo,
        }
    })
});

export const updateContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    const updateData = req.body;

    const updatedContactInfo = await contactService.updateContactInfo(studentId as string, updateData);

    res.status(200).json({
        success: true,
        message: "Contact updated successfully",
        data: {
            contactInfo: updatedContactInfo,
        }
    });
});

export const deleteContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deletedContact = await contactService.deleteContactInfo(id as string);

    res.status(200).json({
        success: true,
        message: "Contact deleted successfully",
        data: {
            contactInfo: deletedContact,
        }
    });
});