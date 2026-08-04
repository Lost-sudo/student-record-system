import { AppError } from "../../middlewares/error.middleware";
import { CreateStudentEmergencyContact, UpdateStudentEmergencyContact } from "./emergency-contact.types";
import { EmergencyContactRepository } from "./emergency-contact.repository";

export class EmergencyContactService {
  constructor(private readonly emergencyContactRepository: EmergencyContactRepository) {}

  async createEmergencyContact(studentId: string, data: CreateStudentEmergencyContact) {
    const student = await this.emergencyContactRepository.findStudentById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    if (data.isPrimary) {
      return this.emergencyContactRepository.transaction(async (tx) => {
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

    return this.emergencyContactRepository.create(studentId, {
      ...data,
      isPrimary: false,
    });
  }

  async getContactByStudentId(studentId: string) {
    return this.emergencyContactRepository.findByStudentId(studentId);
  }

  async updateEmergencyContact(contactId: string, data: UpdateStudentEmergencyContact) {
    const existingContact = await this.emergencyContactRepository.findById(contactId);

    if (!existingContact) {
      throw new AppError("Student emergency contact not found", 404);
    }

    if (data.isPrimary) {
      return this.emergencyContactRepository.transaction(async (tx) => {
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

    return this.emergencyContactRepository.update(contactId, data);
  }

  async deleteEmergencyContact(contactId: string) {
    const existingContact = await this.emergencyContactRepository.findById(contactId);

    if (!existingContact) {
      throw new AppError("Student emergency contact not found", 404);
    }

    const wasPrimary = existingContact.isPrimary;
    const studentId = existingContact.studentId;

    return this.emergencyContactRepository.transaction(async (tx) => {
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
  }
}
