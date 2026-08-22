import { Router } from "express";
import { healthRouter } from "./health.route.js";
import authRouter from "../modules/auth/auth.routes.js";
import { studentRouter } from "../modules/student/student.routes.js";
import contactRoutes from "../modules/contact/contact.routes.js";
import emergencyContactRoutes from "../modules/emergency-contact/emergency-contact.routes.js";
import { academicTermRouter } from "../modules/academic-structure/academic-term/academic-term.routes.js";
import { courseRouter } from "../modules/academic-structure/course/course.routes.js";
import { coursePrerequisiteRouter } from "../modules/academic-structure/course-prerequisite/course-prerequisite.routes.js";
import { curriculumVersionRouter } from "../modules/academic-structure/curriculum-version/curriculum-version.routes.js";
import { degreeRequirementRouter } from "../modules/degree-requirement/degree-requirement.routes.js";
import { courseSectionRouter } from "../modules/academic-structure/course-section/course-section.routes.js";
import { academicRouter } from "../modules/academic-structure/academic-program/academic-program.routes.js";
const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/students", studentRouter);
routes.use("/contactInfo", contactRoutes);
routes.use("/emergencyContact", emergencyContactRoutes);
routes.use("/academic-term", academicTermRouter);
routes.use("/course", courseRouter);
routes.use("/course-prerequisite", coursePrerequisiteRouter);
routes.use("/curriculum-version", curriculumVersionRouter);
routes.use("/degree-requirement", degreeRequirementRouter);
routes.use("/course-section", courseSectionRouter);
routes.use("/academic-program", academicRouter);

export default routes;
