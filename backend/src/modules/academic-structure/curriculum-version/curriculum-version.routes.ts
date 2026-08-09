import { Router } from "express";
import { CurriculumVersionRepository } from "./curriculum-version.repository";
import { prisma } from "../../../database/prisma";
import { AcademicTermRepository } from "../academic-term/academic-term.repository";
import { AcademicProgramRepository } from "../academic-program/academic-program.repository";
import { CurriculumVersionService } from "./curriculum-version.service";
import { CurriculumVersionController } from "./curriculum-version.controller";

const router = Router();

const repository = new CurriculumVersionRepository(prisma);
const academicProgramRepository = new AcademicProgramRepository(prisma);
const academicTermRepository = new AcademicTermRepository(prisma);

const service = new CurriculumVersionService(
  repository,
  academicProgramRepository,
  academicTermRepository,
);

const controller = new CurriculumVersionController(service);

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.remove);

export const curriculumVersionRouter = router;
