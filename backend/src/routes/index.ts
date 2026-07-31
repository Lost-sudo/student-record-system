import { Router } from "express";
import { healthRouter } from "./health.route";
import authRouter from "./auth.routes";
import studentRouter from "./student.routes";
import contactInfoRoutes from "./contactInfo.routes";
import emergencyContactRoutes from "./emergencyContact.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/student", studentRouter);
routes.use("/contactInfo", contactInfoRoutes);
routes.use("/emergencyContact", emergencyContactRoutes);


export default routes;