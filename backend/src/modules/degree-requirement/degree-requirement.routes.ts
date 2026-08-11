import { Router } from "express";
import { DegreeRequirementRepository } from "./degree-requirement.repository";
import { prisma } from "../../database/prisma";
import { CurriculumVersionRepository } from "../academic-structure/curriculum-version/curriculum-version.repository";
import { CourseRepository } from "../academic-structure/course/course.repository";
import { DegreeRequirementService } from "./degree-requirement.service";
import { DegreeRequirementController } from "./degree-requirement.controller";

const router = Router();

const degreeRequirementRepository = new DegreeRequirementRepository(prisma);
const curriculumVersionRepository = new CurriculumVersionRepository(prisma);
const courseRepository = new CourseRepository(prisma);

const service = new DegreeRequirementService(
  degreeRequirementRepository,
  curriculumVersionRepository,
  courseRepository,
);

const controller = new DegreeRequirementController(service);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export const degreeRequirementRouter = router;
