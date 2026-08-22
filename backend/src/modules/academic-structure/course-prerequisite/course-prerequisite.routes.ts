import { Router } from "express";
import { CoursePrerequisiteRepository } from "./course-prerequisite.repository.js";
import { prisma } from "../../../database/prisma.js";
import { CoursePrerequisiteService } from "./course-prerequisite.service.js";
import { CourseRepository } from "../course/course.repository.js";
import { CoursePrerequisiteController } from "./course-prerequisite.controller.js";

const router = Router();

const repository = new CoursePrerequisiteRepository(prisma);
const courseRepository = new CourseRepository(prisma);
const service = new CoursePrerequisiteService(repository, courseRepository);
const controller = new CoursePrerequisiteController(service);

router.get("/", controller.list);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

export const coursePrerequisiteRouter = router;
