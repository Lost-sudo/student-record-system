import { Router } from "express";
import { CoursePrerequisiteRepository } from "./course-prerequisite.repository";
import { prisma } from "../../../database/prisma";
import { CoursePrerequisiteService } from "./course-prerequisite.service";
import { CourseRepository } from "../course/course.repository";
import { CoursePrerequisiteController } from "./course-prerequisite.controller";

const router = Router();

const repository = new CoursePrerequisiteRepository(prisma);
const courseRepository = new CourseRepository(prisma);
const service = new CoursePrerequisiteService(repository, courseRepository);
const controller = new CoursePrerequisiteController(service);

router.get("/", controller.list);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

export const coursePrerequisiteRouter = router;
