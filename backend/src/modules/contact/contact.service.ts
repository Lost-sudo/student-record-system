import { prisma } from "../../database/prisma";
import {CreateContactInfo, UpdateContactInfo} from "./contact.types";
import {AppError} from "../../middlewares/error.middleware";

export class ContactService {
    async createContactInfo(studentId: string, data: CreateContactInfo) {
        const student = await prisma.student.findUnique({ where: { id: studentId } });

        if (!student) {
            throw new AppError("Student not found", 404);
        }

        const existingContactInfo = await prisma.contactInfo.findUnique({
            where: { studentId: studentId },
        });

        if (existingContactInfo) {
            throw new AppError("Contact info already exist for this student. Use update instead", 409);
        }

        return await prisma.contactInfo.create({
            data: {
                ...data,
                studentId: studentId,
            }
        });
    }

    async getContactInfoByStudentId(studentId: string) {
        return await prisma.contactInfo.findUnique({ where: { studentId: studentId } });
    }

    async updateContactInfo(studentId: string, data: UpdateContactInfo) {
        const existingContactInfo = await prisma.contactInfo.findUnique({ where: { studentId: studentId }});

        if (!existingContactInfo) {
            throw new AppError("Contact not found", 404);
        }

        return await prisma.contactInfo.update({
            where: { studentId: studentId },
            data: {
                ...data,
            }
        });
    }

    async deleteContactInfo(id: string) {
        const existingContactInfo = await prisma.contactInfo.findUnique({
            where: { id: id }
        })

        if (!existingContactInfo) {
            throw new AppError("Contact not found", 404);
        }

        return await prisma.contactInfo.delete({
            where: { id: id }
        })
    }
}

export const contactService = new ContactService();