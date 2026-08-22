import { prisma } from "../../database/prisma.js";
import { hashPassword, comparePassword } from "../../utils/password.utils.js";
import { generateTokenPair, verifyRefreshToken } from "../../utils/jwt.utils.js";
import { AppError, ConflictError, UnauthorizedError, ForbiddenError, NotFoundError, InternalServerError } from "../../utils/error.utils.js";
import { isPrismaRecordNotFound, isUniqueConstraintViolation } from "../../utils/prisma-error.utils.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { AuthRepository } from "./auth.repository.js";

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(email: string, username: string, password: string, role: UserRole) {
    const existingUser = await this.authRepository.findUserByEmailOrUsername(email, username);

    if (existingUser) {
      throw new ConflictError("Email or username already in use");
    }

    const passwordHash = await hashPassword(password);

    let user;
    try {
      user = await this.authRepository.createUser(email, username, passwordHash, role);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("Email or username already in use");
      }
      throw new InternalServerError("Failed to register user");
    }

    const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);

    return { user: await this._sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || (!await comparePassword(password, user.passwordHash))) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new ForbiddenError("Account is deactivated");
    }

    try {
      await this.authRepository.updateLastLogin(user.id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new InternalServerError("Failed to update user login");
    }

    const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);
    return { user: await this._sanitizeUser(user), ...tokens };
  }

  async refreshTokens(oldRefreshToken: string) {
    let payload;

    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const storedToken = await this.authRepository.findRefreshToken(oldRefreshToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await this.authRepository.deleteRefreshTokensByUserId(payload.sub);
      }
      throw new UnauthorizedError('Refresh token is invalid or revoked');
    }

    try {
      await this.authRepository.deleteRefreshToken(storedToken.id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new UnauthorizedError("Refresh token is invalid or revoked");
      }
      throw new InternalServerError("Failed to revoke refresh token");
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedError("User no longer active");
    }

    const tokens = await this._generateAndSaveTokens(user.id, user.email, user.role);
    return tokens;
  }

  async logout(refreshToken: string) {
    await this.authRepository.deleteRefreshTokenByToken(refreshToken);
  }

  async getProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) throw new NotFoundError("User not found");
    return await this._sanitizeUser(user);
  }

  private async _generateAndSaveTokens(userId: string, email: string, role: UserRole) {
    const tokens = generateTokenPair(userId, email, role);

    const expiresAt = new Date(Date.now() + tokens.refreshExpiresIn * 1000);

    try {
      await this.authRepository.createRefreshToken(tokens.refreshToken, userId, expiresAt);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new InternalServerError("Failed to save session tokens");
    }

    return tokens;
  }

  private async _sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}

export const authService = new AuthService(new AuthRepository(prisma));
