import { PrismaClient } from "../../generated/prisma/client";
import { UserRole } from "../../generated/prisma/enums";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findUserByEmailOrUsername(email: string, username: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ]
      }
    });
  }

  findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  createUser(email: string, username: string, passwordHash: string, role: UserRole) {
    return this.prisma.user.create({
      data: { email, username, passwordHash, role },
    });
  }

  updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  createRefreshToken(token: string, userId: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    });
  }

  deleteRefreshToken(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  deleteRefreshTokensByUserId(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  deleteRefreshTokenByToken(token: string) {
    return this.prisma.refreshToken.deleteMany({ where: { token } });
  }
}
