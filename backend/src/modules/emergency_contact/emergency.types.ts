import { Prisma } from "../../generated/prisma/client";

export type CreateStudentEmergencyContact = Omit<Prisma.EmergencyContactCreateInput, "student">;
export type UpdateStudentEmergencyContact = Prisma.EmergencyContactUpdateInput;