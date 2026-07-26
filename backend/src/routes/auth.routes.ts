import { Router } from "express";
import * as authController from "../modules/auth/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, refreshTokenSchema } from "../modules/auth/auth.validation";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshTokenSchema), authController.refresh);

router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;