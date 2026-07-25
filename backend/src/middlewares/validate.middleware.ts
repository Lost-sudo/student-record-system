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
    } catch (err: any) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                success:false,
                message: "Validation failed",
                errors: err.issues,
            })
        }

        next(err);
    }
}
