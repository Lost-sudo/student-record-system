import { Router } from "express";
import { prisma } from "../../database/prisma";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { ContactController } from "./contact.controller";
import { ContactRepository } from "./contact.repository";
import { ContactService } from "./contact.service";
import { createContactInformationSchema, updateContactInformationSchema } from "./contact.validator";

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
