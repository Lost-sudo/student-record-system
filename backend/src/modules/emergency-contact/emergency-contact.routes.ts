import { Router } from "express";
import { prisma } from "../../database/prisma.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { EmergencyContactController } from "./emergency-contact.controller.js";
import { EmergencyContactRepository } from "./emergency-contact.repository.js";
import { EmergencyContactService } from "./emergency-contact.service.js";
import { createEmergencyContactSchema, updateEmergencyContactSchema } from "./emergency-contact.validator.js";

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
