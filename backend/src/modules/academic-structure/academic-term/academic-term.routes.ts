import { Router } from "express";
import { AcademicTermRepository } from "./academic-term.repository.js";
import { prisma } from "../../../database/prisma.js";
import { AcademicTermService } from "./academic-term.service.js";
import { AcademicTermController } from "./academic-term.controller.js";

const router = Router();

const repository = new AcademicTermRepository(prisma);
const service = new AcademicTermService(repository);
const controller =  new AcademicTermController(service);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export const academicTermRouter = router;