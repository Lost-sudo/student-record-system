import { Prisma } from "../generated/prisma/client.js";

export function isPrismaKnownRequestError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isUniqueConstraintViolation(error: unknown): boolean {
    return isPrismaKnownRequestError(error) && error.code === 'P2002';
}

export function isForeignKeyConstraintViolation(error: unknown): boolean {
    return isPrismaKnownRequestError(error) && error.code === 'P2003';
}

export function isPrismaRecordNotFound(error: unknown): boolean {
    return isPrismaKnownRequestError(error) && error.code === 'P2025';
}