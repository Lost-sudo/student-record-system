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

router.post("/", validate(createEmergencyContactSchema), emergencyContactController.createEmergencyContact);
router.get("/", emergencyContactController.getEmergencyContactByStudentId);
router.get("/:studentId", emergencyContactController.getEmergencyContactByStudentId);
router.patch("/:studentId", validate(updateEmergencyContactSchema), emergencyContactController.updateEmergencyContact);
router.delete("/:id", emergencyContactController.deleteEmergencyContact);

export default router;