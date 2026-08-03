import { Router } from "express";
import * as contactInfoController from "../modules/contact/contact.controller";
import {validate} from "../middlewares/validate.middleware";
import {authenticate, authorize} from "../middlewares/auth.middleware";
import { createContactInformationSchema, updateContactInformationSchema } from '../modules/contact/contact.validation';

const router = Router();

router.use(authenticate)

router.get("/:studentId", contactInfoController.getContactInfoByStudentId);
router.post("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN"), validate(createContactInformationSchema), contactInfoController.createContactInfo);
router.patch("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN") ,validate(updateContactInformationSchema), contactInfoController.updateContactInfo);
router.delete("/:id", authorize("STUDENT", "REGISTRAR", "SUPER_ADMIN"),contactInfoController.deleteContactInfo);

export default router;