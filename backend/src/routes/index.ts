import { Router } from "express";
import { healthRouter } from "./health.route";
import authRouter from "../modules/auth/auth.routes";
import { studentRouter } from "../modules/student/student.routes";
import contactRoutes from "../modules/contact/contact.routes";
import emergencyContactRoutes from "../modules/emergency-contact/emergency-contact.routes";
import { academicTermRouter } from "../modules/academic-structure/academic-term/academic-term.routes";
import { courseRouter } from "../modules/academic-structure/course/course.routes";
import { coursePrerequisiteRouter } from "../modules/academic-structure/course-prerequisite/course-prerequisite.routes";
import { curriculumVersionRouter } from "../modules/academic-structure/curriculum-version/curriculum-version.routes";
import { degreeRequirementRouter } from "../modules/degree-requirement/degree-requirement.routes";

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

export default routes;
