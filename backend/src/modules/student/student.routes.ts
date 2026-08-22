import { Router } from "express";
import { prisma } from '../../database/prisma.js';
import { StudentController } from './student.controller.js';
import { StudentService } from './student.service.js';
import { StudentRepository } from './student.repository.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const repository = new StudentRepository(prisma);
const service = new StudentService(repository);
const controller = new StudentController(service);

const router = Router();

router.use(authenticate);

router.post("/", authorize("REGISTRAR", "SUPER_ADMIN"), controller.createStudent);
router.get("/", authorize("REGISTRAR", "SUPER_ADMIN"), controller.getStudents);
router.get("/archived", authorize("REGISTRAR", "SUPER_ADMIN"), controller.getArchivedStudents);
router.get("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.getStudentById);
router.patch("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.updateStudent);
router.delete("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.softDeleteStudent);

export const studentRouter = router;
