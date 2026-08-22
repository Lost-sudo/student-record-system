import { AcademicProgram as PrismaAcademicProgram } from '../../../generated/prisma/client.js';
import { AcademicProgramQueryInput, CreateAcademicProgramInput, UpdateAcademicProgramInput } from './academic-program.validator.js';

export type AcademicProgramDto = {
    id: PrismaAcademicProgram['id'];
    programCode: PrismaAcademicProgram['programCode'];
    name: PrismaAcademicProgram['name'];
    degreeType: PrismaAcademicProgram['degreeType'];
    description: PrismaAcademicProgram['description'];
    isActive: PrismaAcademicProgram['isActive'];
    createdAt: PrismaAcademicProgram['createdAt'];
    updatedAt: PrismaAcademicProgram['updatedAt'];
}

export type {
    AcademicProgramQueryInput,
    CreateAcademicProgramInput,
    UpdateAcademicProgramInput,
};