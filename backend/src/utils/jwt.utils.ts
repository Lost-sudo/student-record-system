import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { UserRole } from "../generated/prisma/enums";

export interface JwtPayload {
    sub: string,
    email: string,
    role: UserRole;
    type: 'access' | 'refresh';
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessExpiresIn: number;
    refreshExpiresIn: number;
}

function parseExpiresIn(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiresIn format: ${value}`);
    const num = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
        s: 1, m: 60, h: 3600, d: 86400,
    };
    return num * multipliers[unit];
}

export function generateTokenPair(userId: string, email: string, role: UserRole): TokenPair {
    const accessPayload: JwtPayload = {
        sub: userId,
        email,
        role,
        type: "access",
    };

    const refreshPayload: JwtPayload = {
        sub: userId,
        email,
        role,
        type: "refresh",
    };

    const accessToken = jwt.sign(accessPayload, jwtConfig.access.secret, {
        expiresIn: jwtConfig.access.expiresIn as SignOptions['expiresIn'],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    });

    const refreshToken = jwt.sign(refreshPayload, jwtConfig.refresh.secret, {
        expiresIn: jwtConfig.refresh.expiresIn as SignOptions['expiresIn'],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    });

    return {
        accessToken,
        refreshToken,
        accessExpiresIn: parseExpiresIn(jwtConfig.access.expiresIn),
        refreshExpiresIn: parseExpiresIn(jwtConfig.refresh.expiresIn),
    }
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, jwtConfig.access.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, jwtConfig.refresh.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
    }) as JwtPayload;
}

