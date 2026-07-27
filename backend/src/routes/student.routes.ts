import { Router } from "express";
import * as studentController from "../modules/student/student.controller";

const router = Router();

router.post("/", studentController.createStudent);
router.get("/", studentController.getStudents);
router.get("/:id", studentController.getStudentById);
router.patch("/:id", studentController.updateStudent);
router.delete("/:id", studentController.softDeleteStudent);

export default router;