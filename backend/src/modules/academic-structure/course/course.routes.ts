import { Router } from "express";
import { CourseRepository } from "./course.repository";
import { prisma } from "../../../database/prisma";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";

const router = Router();

const repository = new CourseRepository(prisma);
const service = new CourseService(repository);
const controller = new CourseController(service);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export const courseRouter = router;