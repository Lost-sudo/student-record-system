import { AppError, InternalServerError, NotFoundError } from "../../utils/error.utils";
import { isForeignKeyConstraintViolation, isPrismaRecordNotFound } from "../../utils/prisma-error.utils";
import { CreateStudentEmergencyContact, UpdateStudentEmergencyContact } from "./emergency-contact.types";
import { EmergencyContactRepository } from "./emergency-contact.repository";

export class EmergencyContactService {
  constructor(private readonly emergencyContactRepository: EmergencyContactRepository) {}

  async createEmergencyContact(studentId: string, data: CreateStudentEmergencyContact) {
    const student = await this.emergencyContactRepository.findStudentById(studentId);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    try {
      if (data.isPrimary) {
        return await this.emergencyContactRepository.transaction(async (tx) => {
          await tx.emergencyContact.updateMany({
            where: { studentId, isPrimary: true },
            data: { isPrimary: false },
          });

          return tx.emergencyContact.create({
            data: {
              ...data,
              studentId,
              isPrimary: true,
            },
          });
        });
      }

      return await this.emergencyContactRepository.create(studentId, {
        ...data,
        isPrimary: false,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isForeignKeyConstraintViolation(error)) {
        throw new NotFoundError("Student not found");
      }
      throw new InternalServerError("Failed to create emergency contact");
    }
  }

  async getContactByStudentId(studentId: string) {
    return this.emergencyContactRepository.findByStudentId(studentId);
  }

  async updateEmergencyContact(contactId: string, data: UpdateStudentEmergencyContact) {
    const existingContact = await this.emergencyContactRepository.findById(contactId);

    if (!existingContact) {
      throw new NotFoundError("Student emergency contact not found");
    }

    try {
      if (data.isPrimary) {
        return await this.emergencyContactRepository.transaction(async (tx) => {
          await tx.emergencyContact.updateMany({
            where: {
              studentId: existingContact.studentId,
              isPrimary: true,
              id: { not: contactId },
            },
            data: {
              isPrimary: false,
            },
          });

          return tx.emergencyContact.update({
            where: { id: contactId },
            data,
          });
        });
      }

      return await this.emergencyContactRepository.update(contactId, data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Student emergency contact not found");
      }
      throw new InternalServerError("Failed to update emergency contact");
    }
  }

  async deleteEmergencyContact(contactId: string) {
    const existingContact = await this.emergencyContactRepository.findById(contactId);

    if (!existingContact) {
      throw new NotFoundError("Student emergency contact not found");
    }

    const wasPrimary = existingContact.isPrimary;
    const studentId = existingContact.studentId;

    try {
      return await this.emergencyContactRepository.transaction(async (tx) => {
        await tx.emergencyContact.delete({ where: { id: contactId } });

        if (wasPrimary) {
          const oldestContact = await tx.emergencyContact.findFirst({
            where: { studentId },
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
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Student emergency contact not found");
      }
      throw new InternalServerError("Failed to delete emergency contact");
    }
  }
}
