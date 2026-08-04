import { Router } from "express";
import { prisma } from '../../database/prisma';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const repository = new StudentRepository(prisma);
const service = new StudentService(repository);
const controller = new StudentController(service);

const router = Router();

router.use(authenticate);

router.post("/", authorize("REGISTRAR", "SUPER_ADMIN"), controller.createStudent);
router.get("/", authorize("REGISTRAR", "SUPER_ADMIN"), controller.getStudents);
router.get("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.getStudentById);
router.patch("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.updateStudent);
router.delete("/:id", authorize("REGISTRAR", "SUPER_ADMIN"), controller.softDeleteStudent);

export const studentRouter = router;
