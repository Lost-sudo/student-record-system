import { Request, Response } from "express";
import { authService } from "./auth.service";
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

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, role } = req.body;

    const result = await authService.register(email, username, password, role);

    setRefreshTokenCookie(res, result.refreshToken, result.refreshExpiresIn);

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        }
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    setRefreshTokenCookie(res, result.refreshToken, result.refreshExpiresIn);

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const tokens = await authService.refreshTokens(refreshToken);

    setRefreshTokenCookie(res, tokens.refreshToken, tokens.refreshExpiresIn);

    res.status(200).json({
        success: true,
        message: "Token refresh successfully",
        data: {
            accessToken: tokens.accessToken,
        },
    });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", { path: "/"});

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getProfile(req.user!.id);

    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
});