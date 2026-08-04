import { AppError } from "../../middlewares/error.middleware";
import { ContactRepository } from "./contact.repository";
import { CreateContactInfo, UpdateContactInfo } from "./contact.types";

export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async createContactInfo(studentId: string, data: CreateContactInfo) {
    const student = await this.contactRepository.findStudentById(studentId);

    if (!student) {
      throw new AppError("Student not found", 404);
    }

    const existingContactInfo = await this.contactRepository.findByStudentId(studentId);

    if (existingContactInfo) {
      throw new AppError("Contact info already exist for this student. Use update instead", 409);
    }

    return this.contactRepository.create(studentId, data);
  }

  async getContactInfoByStudentId(studentId: string) {
    return this.contactRepository.findByStudentId(studentId);
  }

  async updateContactInfo(studentId: string, data: UpdateContactInfo) {
    const existingContactInfo = await this.contactRepository.findByStudentId(studentId);

    if (!existingContactInfo) {
      throw new AppError("Contact not found", 404);
    }

    return this.contactRepository.updateByStudentId(studentId, data);
  }

  async deleteContactInfo(id: string) {
    const existingContactInfo = await this.contactRepository.findById(id);

    if (!existingContactInfo) {
      throw new AppError("Contact not found", 404);
    }

    return this.contactRepository.deleteById(id);
  }
}
