import { Router } from "express";
import { prisma } from "../../database/prisma";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { EmergencyContactController } from "./emergency-contact.controller";
import { EmergencyContactRepository } from "./emergency-contact.repository";
import { EmergencyContactService } from "./emergency-contact.service";
import { createEmergencyContactSchema, updateEmergencyContactSchema } from "./emergency-contact.validator";

const repository = new EmergencyContactRepository(prisma);
const service = new EmergencyContactService(repository);
const controller = new EmergencyContactController(service);

const router = Router();

router.use(authenticate);

router.get("/:studentId", controller.getEmergencyContactByStudentId);
router.post("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN"), validate(createEmergencyContactSchema), controller.createEmergencyContact);
router.patch("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), validate(updateEmergencyContactSchema), controller.updateEmergencyContact);
router.delete("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.deleteEmergencyContact);

export default router;
