import { Router } from "express";
import { healthRouter } from "./health.route";
import authRouter from "./auth.routes";
import { studentRouter } from "../modules/student/student.routes";
import contactRoutes from "../modules/contact/contact.routes";
import emergencyContactRoutes from "../modules/emergency-contact/emergency-contact.routes";
import { academicTermRouter } from '../modules/academic-structure/academic-term/academic-term.routes';
import router from "./auth.routes";
import { courseRouter } from "../modules/academic-structure/course/course.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/students", studentRouter);
routes.use("/contactInfo", contactRoutes);
routes.use("/emergencyContact", emergencyContactRoutes);
router.use("/academic-term", academicTermRouter);
router.use("/course", courseRouter);


export default routes;
