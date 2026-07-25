import { Request, Response, NextFunction } from "express";
import z from "zod";

export const validate = (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
        });
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