import { Request, Response, NextFunction } from "express";
import z from "zod";

export const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed: any = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
        });

        if (parsed.body !== undefined) req.body = parsed.body;
        if (parsed.query !== undefined) req.query = parsed.query;
        if (parsed.params !== undefined) req.params = parsed.params;
        if (parsed.cookies !== undefined) req.cookies = parsed.cookies;

        next();
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            const messages = err.issues.map((issue) => {
                const path = issue.path.length > 0 ? issue.path.join(".") : "";
                return path ? `${path}: ${issue.message}` : issue.message;
            });

            return res.status(400).json({
                success: false,
                message: messages.join("; "),
                errors: err.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                    code: issue.code,
                })),
            });
        }

        next(err);
    }
}
