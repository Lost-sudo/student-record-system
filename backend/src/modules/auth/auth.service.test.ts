import { authService } from "./auth.service";
import { prisma } from "../../database/prisma";
import { hashPassword, comparePassword } from "../../utils/password.utils";
import { generateTokenPair, verifyRefreshToken } from "../../utils/jwt.utils";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../utils/error.utils";
import { UserRole } from "../../generated/prisma/enums";
import { email } from "zod";

jest.mock("../../utils/prisma-error.utils", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

// Mocks
jest.mock("../../database/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('../../utils/password.utils');
jest.mock('../../utils/jwt.utils');

const mockPrisma = prisma as unknown as {
    user: {
        findFirst: jest.Mock;
        findUnique: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
    };
    refreshToken: {
        findUnique: jest.Mock;
        create: jest.Mock;
        delete: jest.Mock;
        deleteMany: jest.Mock;
    };
};
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockGenerateTokenPair = generateTokenPair as jest.MockedFunction<typeof generateTokenPair>;
const mockVerifyRefreshToken = verifyRefreshToken as jest.MockedFunction<typeof verifyRefreshToken>;

const mockUser = {
    id: "user-123",
    email: "test@example.com",
    username: "testuser",
    passwordHash: "hashed_password_123",
    role: "STUDENT" as UserRole,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockTokens = {
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
    accessExpiresIn: 900,
    refreshExpiresIn: 604800,
};

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockHashPassword.mockResolvedValue("hashed_password_123");
        mockGenerateTokenPair.mockReturnValue(mockTokens);
    });

    // Register
    describe("register", () => {
        it("should successfully register a new user", async() => {
            mockPrisma.user.findFirst.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue(mockUser);

            const result = await authService.register("test@example.com", "testuser", "password123", "STUDENT");

            expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        {email: "test@example.com"},
                        {username: "testuser"},
                    ]
                },
            });
            expect(mockHashPassword).toHaveBeenCalledWith("password123");
            expect(mockPrisma.user.create).toHaveBeenCalled();
            expect(mockPrisma.refreshToken.create).toHaveBeenCalled();

            expect(result.user).not.toHaveProperty("passwordHash");
            expect(result.accessToken).toBe("mock_access_token");
        });

        it("should throw ConflictError if email or username already exists", async () => {
            mockPrisma.user.findFirst.mockResolvedValue(mockUser);

            await expect(
                authService.register("test@example.com", "testuser", "password123", "STUDENT")
            ).rejects.toThrow(ConflictError);

            expect(mockPrisma.user.create).not.toHaveBeenCalled();
        });
    })

    // Login
    describe("login", () => {
        it("should successfully login a user", async() => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockComparePassword.mockResolvedValue(true);

            const result = await authService.login("test@example.com", "password123");

            expect(mockComparePassword).toHaveBeenCalledWith("password123", "hashed_password_123");
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: {id: "user-123"},
                data: {lastLoginAt: expect.any(Date)},
            });
            expect(result.user.email).toBe("test@example.com");
            expect(result.accessToken).toBe("mock_access_token");
        });

        it("should throw UnauthorizedError if user is not found", async() => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const loginPromise = authService.login("wrong@example.com", "password123");
            await expect(loginPromise).rejects.toThrow(UnauthorizedError);
            await expect(loginPromise).rejects.toThrow("Invalid email or password");
        });

        it("should throw UnauthorizedError if password is incorrect", async() => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockComparePassword.mockResolvedValue(false);

            const loginPromise = authService.login("test@example.com", "wrongpassword");
            await expect(loginPromise).rejects.toThrow(UnauthorizedError);
            await expect(loginPromise).rejects.toThrow("Invalid email or password");
        });

        it("should throw ForbiddenError if user account is deactivated", async() => {
            const inactiveUser = {...mockUser, isActive: false};
            mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);
            mockComparePassword.mockResolvedValue(true);

            const loginPromise = authService.login("test@example.com", "wrongpassword");
            await expect(loginPromise).rejects.toThrow(ForbiddenError);
            await expect(loginPromise).rejects.toThrow("Account is deactivated");
        });
    });

    describe("refreshTokens", () => {
        const futureDate = new Date(Date.now() + 100000);

        it("should successfully refresh tokens and rotates them", async() => {
            mockVerifyRefreshToken.mockReturnValue({
                sub: "user-123", email: "test@example.com", role: "STUDENT", type: "refresh"
            });

            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                id: "token-id",
                token: "old_refresh_token",
                userId: "user-123",
                expiresAt: futureDate,
                createAt: new Date(),
            });

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await authService.refreshTokens('old_refresh_token');

            expect(mockVerifyRefreshToken).toHaveBeenCalledWith('old_refresh_token');
            expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'token-id' } });
            expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
            expect(result.accessToken).toBe('mock_access_token');
        });

        it('should throw UnauthorizedError if JWT verification fails', async () => {
            mockVerifyRefreshToken.mockImplementation(() => { throw new Error('Invalid token'); });

            const refreshPromise = authService.refreshTokens('invalid_token');
            await expect(refreshPromise).rejects.toThrow(UnauthorizedError);
            await expect(refreshPromise).rejects.toThrow('Invalid or expired refresh token');
        });

        it('should throw UnauthorizedError and revoke all tokens if stored token is expired', async () => {
            const pastDate = new Date(Date.now() - 100000);
            
            mockVerifyRefreshToken.mockReturnValue({ 
                sub: 'user-123', email: 'test@example.com', role: 'STUDENT', type: 'refresh' 
            });
            
            mockPrisma.refreshToken.findUnique.mockResolvedValue({
                id: 'token-id',
                token: 'expired_token',
                userId: 'user-123',
                expiresAt: pastDate, // Expired!
                createdAt: new Date(),
            });

            const refreshPromise = authService.refreshTokens('expired_token');
            await expect(refreshPromise).rejects.toThrow(UnauthorizedError);
            await expect(refreshPromise).rejects.toThrow('Refresh token is invalid or revoked');

            // Security measure: Should delete ALL tokens for this user
            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { userId: 'user-123' },
            });
        });
    });

    describe('logout', () => {
        it('should delete the refresh token from the database', async () => {
            await authService.logout('some_refresh_token');
            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { token: 'some_refresh_token' },
            });
        });
    });

    describe('getProfile', () => {
        it('should return sanitized user profile', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);

            const result = await authService.getProfile('user-123');

            expect(result).not.toHaveProperty('passowrdHash');
            expect(result.email).toBe('test@example.com');
        });

        it('should throw NotFoundError if user is not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const profilePromise = authService.getProfile('invalid-id');
            await expect(profilePromise).rejects.toThrow(NotFoundError);
            await expect(profilePromise).rejects.toThrow('User not found');
        });
    });
})
