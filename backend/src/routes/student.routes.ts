import { Router } from "express";
import * as studentController from "../modules/student/student.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createStudentSchema, updateStudentSchema } from "../modules/student/student.validation";


const router = Router();
router.use(authenticate)

router.post("/", validate(createStudentSchema), authorize("REGISTRAR", "SUPER_ADMIN"), studentController.createStudent);
router.get("/", authorize("REGISTRAR", "SUPER_ADMIN"), studentController.getStudents);
router.get("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), studentController.getStudentById);
router.patch("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), validate(updateStudentSchema), authorize("REGISTRAR", "SUPER_ADMIN"), studentController.updateStudent);
router.delete("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), studentController.softDeleteStudent);

export default router;