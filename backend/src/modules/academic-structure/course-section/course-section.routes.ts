import { Router } from "express";
import { CourseSectionRepository } from "./course-section.repository";
import { prisma } from "../../../database/prisma";
import { CourseRepository } from "../course/course.repository";
import { AcademicTermRepository } from "../academic-term/academic-term.repository";
import { CourseSectionService } from "./course-section.service";
import { CourseSectionController } from "./course-section.controller";

const router = Router();

const courseSectionRepository = new CourseSectionRepository(prisma);
const courseRepository = new CourseRepository(prisma);
const academicTermRepository = new AcademicTermRepository(prisma);

const service = new CourseSectionService(
  courseSectionRepository,
  courseRepository,
  academicTermRepository,
);

const controller = new CourseSectionController(service);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export const courseSectionRouter = router;
