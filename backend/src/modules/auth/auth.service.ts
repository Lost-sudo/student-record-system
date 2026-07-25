import { prisma } from "../../database/prisma";
import { hashPassword, comparePassword } from "../../utils/password.utils";
import { generateTokenPair, verifyRefreshToken } from "../../utils/jwt.utils";
import { AppError } from "../../middlewares/error.middleware";
import { UserRole } from "../../generated/prisma/enums";

export class AuthService {
    async register(email: string, username: string, password: string, role: UserRole) {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    {email},
                    {username},
                ]
            }
        });

        if (existingUser) {
            throw new AppError("Email or username already in use", 409);
        }

        const passwordHash = await hashPassword(password);
        
        const user = await prisma.user.create({
            data: {email, username, passwordHash, role},
        });

        const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);

        return {user: this._sanitizeUser(user), ...tokens};
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: {email}
        });

        if (!user || (await comparePassword(password, user.passwordHash))) {
            throw new AppError("Invalid email or password", 401);
        }

        if (!user.isActive) {
            throw new AppError("Account is deactivated", 403);
        }

        await prisma.user.update({
            where: {id : user.id},
            data: { lastLoginAt: new Date() }
        });

        const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);
        return { user: this._sanitizeUser(user), ...tokens };
    }

    async refreshTokens(oldRefreshToken: string) {
        let payload;

        try {
            payload = verifyRefreshToken(oldRefreshToken);
        } catch {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: oldRefreshToken },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await prisma.refreshToken.deleteMany({ where: {userId: payload.sub} })
            }
            throw new AppError('Refresh token is invalid or revoked', 401);
        }

        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const user = await prisma.user.findUnique({ where: { id: payload.sub } });

        if (!user || !user.isActive) {
            throw new AppError("User no longer active", 401);
        }

        const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);
        return tokens;
    }

    async logout(refreshToken: string) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId }});

        if (!user) throw new AppError("User not found", 404);
        return this._sanitizeUser(user);
    }

    private async _generateAndSaveTokens(userId: string, email: string, role: UserRole) {
        const tokens = generateTokenPair(userId, email, role);

        const expiresAt = new Date(Date.now() + tokens.refreshExpiresIn * 1000);

        await prisma.refreshToken.create({
            data: {
                token: tokens.refreshToken,
                userId,
                expiresAt
            }
        });

        return tokens;
    }

    private async _sanitizeUser(user: any) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
    }
}

export const authService = new AuthService()