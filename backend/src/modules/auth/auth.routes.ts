import { Router } from "express";
import { prisma } from "../../database/prisma";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { AuthController } from "./auth.controller";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.validator";

const repository = new AuthRepository(prisma);
const service = new AuthService(repository);
const controller = new AuthController(service);

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshTokenSchema), controller.refresh);

router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getMe);

export default router;
