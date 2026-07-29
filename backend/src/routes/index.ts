import { Router } from "express";
import { healthRouter } from "./health.route";
import authRouter from "./auth.routes";
import studentRouter from "./student.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);
routes.use("/student", studentRouter);

export default routes;