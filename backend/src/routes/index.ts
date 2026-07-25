import { Router } from "express";
import { healthRouter } from "./health.route";
import authRouter from "./auth.routes";

const routes = Router();

routes.use("/health", healthRouter);
routes.use("/auth", authRouter);

export default routes;