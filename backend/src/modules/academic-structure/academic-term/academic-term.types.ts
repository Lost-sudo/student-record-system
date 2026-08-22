import { AcademicTerm as PrismaAcademicTerm } from '../../../generated/prisma/client.js';
import type { AcademicTermQueryInput, CreateAcademicTermInput, UpdateAcademicTermInput } from "./academic-term.validator.js";

export type AcademicTermDto = {
    id: PrismaAcademicTerm['id'];
    termCode: PrismaAcademicTerm['termCode'];
    name: PrismaAcademicTerm['name'];
    startDate: PrismaAcademicTerm['startDate'];
    endDate: PrismaAcademicTerm['endDate'];
    isActive: PrismaAcademicTerm['isActive'];
    createdAt: PrismaAcademicTerm['createdAt'];
    updatedAt: PrismaAcademicTerm['updatedAt'];
};

export type {
    AcademicTermQueryInput,
    CreateAcademicTermInput,
    UpdateAcademicTermInput,
};