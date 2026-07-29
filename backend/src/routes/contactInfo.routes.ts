import { Router } from "express";
import * as contactInfoController from "../modules/contact/contact.controller";
import {validate} from "../middlewares/validate.middleware";
import {authenticate, authorize} from "../middlewares/auth.middleware";
import {createContactInformationSchema} from "../modules/contact/contact.validation";
import {updateStudentSchema} from "../modules/student/student.validation";


const router = Router();

router.use(authenticate)

router.get("/:studentId", contactInfoController.getContactInfoByStudentId);
router.post("/", validate(createContactInformationSchema), contactInfoController.createContactInfo);
router.patch("/:studentId", validate(updateStudentSchema), contactInfoController.updateContactInfo);
router.delete("/:studentId", authorize("STUDENT", "REGISTRAR", "SUPER_ADMIN"),contactInfoController.deleteContactInfo);

export default router;