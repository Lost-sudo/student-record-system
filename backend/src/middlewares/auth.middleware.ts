import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.utils";
import { UserRole } from "../generated/prisma/client";
import { prisma } from "../database/prisma";

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const header = req.headers.authorization;

        if (!header?.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Missing or malformed token"
            });
        }

        const token = header.slice(7);
        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: {id: payload.sub},
            select: {id: true, email: true, role: true, isActive: true},
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: "User no longer active"
            });
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Not authenticated"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Insufficient permissions"
            })
        }
        next();
    }
}