import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { studentIdParamsSchema, uuidParamsSchema } from "../../utils/zod.js";
import { EmergencyContactService } from "./emergency-contact.service.js";
import { createEmergencyContactSchema, updateEmergencyContactSchema } from "./emergency-contact.validator.js";

export class EmergencyContactController {
  constructor(private readonly service: EmergencyContactService) {}

  createEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = studentIdParamsSchema.parse(req.params);
    const input = createEmergencyContactSchema.parse({
      body: req.body,
    }).body;
    const result = await this.service.createEmergencyContact(studentId, input);

    return res.status(201).json({
      success: true,
      message: "Emergency contact created successfully",
      data: { emergencyContact: result },
    });
  });

  getEmergencyContactByStudentId = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = studentIdParamsSchema.parse(req.params);
    const result = await this.service.getContactByStudentId(studentId);

    return res.status(200).json({
      success: true,
      message: "Student emergency contacts fetched successfully",
      data: { emergencyContact: result },
    });
  });

  updateEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const input = updateEmergencyContactSchema.parse({
      body: req.body,
    }).body;
    const updatedEmergencyContact = await this.service.updateEmergencyContact(id, input);

    return res.status(200).json({
      success: true,
      message: "Emergency contact updated successfully",
      data: { emergencyContact: updatedEmergencyContact },
    });
  });

  deleteEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const { id } = uuidParamsSchema.parse(req.params);
    const deletedEmergencyContact = await this.service.deleteEmergencyContact(id);

    return res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully",
      data: { emergencyContact: deletedEmergencyContact },
    });
  });
}
