import { Router } from 'express';
import { prisma } from '../../../database/prisma';
import { AcademicProgramController } from './academic-program.controller';
import { AcademicProgramService } from './academic-program.service';
import { AcademicProgramRepository } from './academic-program.repository';

const router = Router();

const repository = new AcademicProgramRepository(prisma);
const service = new AcademicProgramService(repository);
const controller = new AcademicProgramController(service);

router.get("/", controller.list);
router.get("/:id", controller.getById)
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export const academicRouter = router;