import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { env } from "../../config/env";

const setRefreshTokenCookie = (res: Response, token: string, maxAgeInSeconds: number) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: maxAgeInSeconds * 1000,
    path: "/",
  });
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, role } = req.body;

    const result = await this.authService.register(email, username, password, role);

    setRefreshTokenCookie(res, result.refreshToken, result.refreshExpiresIn);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.user,
      accessToken: result.accessToken,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);

    setRefreshTokenCookie(res, result.refreshToken, result.refreshExpiresIn);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
      accessToken: result.accessToken,

    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const tokens = await this.authService.refreshTokens(refreshToken);

    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshExpiresIn);

    res.status(200).json({
      success: true,
      message: "Token refresh successfully",
      accessToken: tokens.accessToken,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", { path: "/" });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.authService.getProfile(req.user!.id);

    res.status(200).json({
      success: true,
      user,
    });
  });
}
