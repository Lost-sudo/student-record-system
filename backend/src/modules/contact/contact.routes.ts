import { Router } from "express";
import { prisma } from "../../database/prisma.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ContactController } from "./contact.controller.js";
import { ContactRepository } from "./contact.repository.js";
import { ContactService } from "./contact.service.js";
import { createContactInformationSchema, updateContactInformationSchema } from "./contact.validator.js";

const repository = new ContactRepository(prisma);
const service = new ContactService(repository);
const controller = new ContactController(service);

const router = Router();

router.use(authenticate);

router.get("/:studentId", controller.getContactInfoByStudentId);
router.post("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN"), validate(createContactInformationSchema), controller.createContactInfo);
router.patch("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN"), validate(updateContactInformationSchema), controller.updateContactInfo);
router.delete("/:id", authorize("STUDENT", "REGISTRAR", "SUPER_ADMIN"), controller.deleteContactInfo);

export default router;
