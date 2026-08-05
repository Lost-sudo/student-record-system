import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { AppError, NotFoundError } from "../utils/error.utils";
import { errorHandler } from "./error.middleware";

jest.mock("../config/logger", () => ({
    logger: {
        error: jest.fn(),
    },
}));

const mockLoggerError = logger.error as jest.Mock;

const createMockResponse = () => {
    const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return res as Response;
};

const createMockRequest = () => ({}) as Request;
const createMockNext = () => jest.fn() as unknown as NextFunction;

describe("errorHandler", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
        jest.clearAllMocks();
        process.env.NODE_ENV = originalEnv;
    });

    it("should respond with the AppError statusCode and message", () => {
        const res = createMockResponse();
        const error = new AppError("Something went wrong", 422);

        errorHandler(error, createMockRequest(), res, createMockNext());

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Something went wrong",
        });
    });

    it("should respond with the subclass statusCode and message", () => {
        const res = createMockResponse();
        const error = new NotFoundError("Resource not found");

        errorHandler(error, createMockRequest(), res, createMockNext());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Resource not found",
        });
    });

    it("should default to 500 Internal Server Error for unknown errors", () => {
        const res = createMockResponse();
        const error = new Error("Database connection failed");

        errorHandler(error, createMockRequest(), res, createMockNext());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal Server Error",
        });
    });

    it("should log unknown errors even in production", () => {
        process.env.NODE_ENV = "production";
        const res = createMockResponse();

        errorHandler(new Error("Unexpected failure"), createMockRequest(), res, createMockNext());

        expect(mockLoggerError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should log AppError only in development", () => {
        process.env.NODE_ENV = "production";
        const res = createMockResponse();

        errorHandler(new AppError("Client mistake", 400), createMockRequest(), res, createMockNext());

        expect(mockLoggerError).not.toHaveBeenCalled();
    });

    it("should include the stack only in development", () => {
        process.env.NODE_ENV = "development";
        const res = createMockResponse();
        const error = new Error("Boom");

        errorHandler(error, createMockRequest(), res, createMockNext());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
                message: "Internal Server Error",
                stack: expect.any(String),
            }),
        );
    });

    it("should not include the stack outside development", () => {
        process.env.NODE_ENV = "production";
        const res = createMockResponse();
        const error = new NotFoundError("Gone");

        errorHandler(error, createMockRequest(), res, createMockNext());

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Gone",
        });
    });
});
