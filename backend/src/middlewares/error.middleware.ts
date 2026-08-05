import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { AppError } from "../utils/error.utils";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;
    const message = isAppError ? err.message : "Internal Server Error";

    if (!isAppError || process.env.NODE_ENV === "development") {
        logger.error(err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
}