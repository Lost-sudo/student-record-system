import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { studentIdParamsSchema, uuidParamsSchema } from "../../utils/zod";
import { ContactService } from "./contact.service";

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  getContactInfoByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = studentIdParamsSchema.parse(req.params);
    const contactInfo = await this.contactService.getContactInfoByStudentId(studentId);

    return res.status(200).json({
      success: true,
      message: "Student contact information fetched successfully",
      data: { contactInfo },
    });
  });

  createContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = studentIdParamsSchema.parse(req.params);
    const newContactInfo = await this.contactService.createContactInfo(studentId, req.body);

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: { contactInfo: newContactInfo },
    });
  });

  updateContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = studentIdParamsSchema.parse(req.params);
    const updatedContactInfo = await this.contactService.updateContactInfo(studentId, req.body);

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: { contactInfo: updatedContactInfo },
    });
  });

  deleteContactInfo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const deletedContact = await this.contactService.deleteContactInfo(id);

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: { contactInfo: deletedContact },
    });
  });
}
