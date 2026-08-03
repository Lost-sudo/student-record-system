import { Router } from "express";
import * as emergencyContactController from "../modules/emergency_contact/emergency.controller";
import {validate} from "../middlewares/validate.middleware";
import {authenticate, authorize} from "../middlewares/auth.middleware";
import {
    createEmergencyContactSchema,
    updateEmergencyContactSchema
} from "../modules/emergency_contact/emergency.validation";

const router = Router();

router.use(authenticate)

router.get("/:studentId", emergencyContactController.getEmergencyContactByStudentId);
router.get("/", emergencyContactController.getEmergencyContactByStudentId);
router.post("/:studentId", authorize("REGISTRAR", "SUPER_ADMIN"), validate(createEmergencyContactSchema), emergencyContactController.createEmergencyContact);
router.patch("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), validate(updateEmergencyContactSchema), emergencyContactController.updateEmergencyContact);
router.delete("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), emergencyContactController.deleteEmergencyContact);

export default router;