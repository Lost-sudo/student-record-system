import { prisma } from "../../database/prisma";
import { Prisma } from "../../generated/prisma/client";
import {AppError} from "../../middlewares/error.middleware";
import {CreateStudentEmergencyContact, UpdateStudentEmergencyContact} from "./emergency.types";


export class EmergencyContactService {
    async createEmergencyContact(studentId: string, data: CreateStudentEmergencyContact) {
        const student = await prisma.student.findUnique({ where: { id: studentId }});

        if (!student) {
            throw new AppError("Student not found", 404);
        }

        if (data.isPrimary) {
            return await prisma.$transaction(async (tx) => {
                await tx.emergencyContact.updateMany({
                    where: {studentId: studentId, isPrimary: true},
                    data: { isPrimary: false },
                });

                return await tx.emergencyContact.create({
                    data: {
                        ...data,
                        studentId: studentId,
                        isPrimary: true
                    },
                });
            });
        } else {
            return await prisma.emergencyContact.create({
                data: {
                    ...data,
                    studentId: studentId,
                    isPrimary: false,
                },
            });
        }
    }

    async getContactByStudentId(studentId: string) {
        return await prisma.emergencyContact.findMany({
            where: { studentId: studentId },
            orderBy: [
                { isPrimary: "desc" },
                { createdAt: "desc" },
            ],
        });
    }

    async updateEmergencyContact(contactId: string, data: UpdateStudentEmergencyContact) {
        const existingContact = await prisma.emergencyContact.findUnique({ where: {  id: contactId }});

        if (!existingContact) {
            throw new AppError("Student emergency contact not found", 404);
        }

        if (data.isPrimary) {
            return await prisma.$transaction(async (tx) => {
                await tx.emergencyContact.updateMany({
                    where: {
                        studentId: existingContact.studentId,
                        isPrimary: true,
                        id: { not: contactId }
                    },
                    data: {
                        isPrimary: false
                    },
                });

                return await tx.emergencyContact.update({
                    where: { id: contactId },
                    data,
                });
            });
        } else {
            return await prisma.emergencyContact.update({
                where: { id: contactId },
                data,
            });
        }
    }

    async deleteEmergencyContact(contactId: string) {
        const existingContact = await prisma.emergencyContact.findUnique({ where: { id: contactId }});

        if (!existingContact) {
            throw new AppError("Student emergency contact not found", 404);
        }

        const wasPrimary = existingContact.isPrimary;
        const studentId = existingContact.studentId;

        await prisma.$transaction(async (tx) => {
            await tx.emergencyContact.delete({ where: { id: contactId } });

            if (wasPrimary) {
                const oldestContact = await tx.emergencyContact.findFirst({
                    where: { studentId: studentId },
                    orderBy: { createdAt: "asc" },
                });

                if (oldestContact) {
                    await tx.emergencyContact.update({
                        where: { id: oldestContact.id },
                        data: { isPrimary: true },
                    });
                }
            }
        });
    }
}

export const emergencyContactService = new EmergencyContactService();