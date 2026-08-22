import { AppError, ConflictError, InternalServerError, NotFoundError } from "../../utils/error.utils.js";
import { isForeignKeyConstraintViolation, isPrismaRecordNotFound, isUniqueConstraintViolation } from "../../utils/prisma-error.utils.js";
import { ContactRepository } from "./contact.repository.js";
import { CreateContactInfo, UpdateContactInfo } from "./contact.types.js";

export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async createContactInfo(studentId: string, data: CreateContactInfo) {
    const student = await this.contactRepository.findStudentById(studentId);

    if (!student) {
      throw new NotFoundError("Student not found");
    }

    const existingContactInfo = await this.contactRepository.findByStudentId(studentId);

    if (existingContactInfo) {
      throw new ConflictError("Contact info already exist for this student. Use update instead");
    }

    try {
      return await this.contactRepository.create(studentId, data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isUniqueConstraintViolation(error)) {
        throw new ConflictError("Contact info already exist for this student. Use update instead");
      }
      if (isForeignKeyConstraintViolation(error)) {
        throw new NotFoundError("Student not found");
      }
      throw new InternalServerError("Failed to create contact info");
    }
  }

  async getContactInfoByStudentId(studentId: string) {
    return this.contactRepository.findByStudentId(studentId);
  }

  async updateContactInfo(studentId: string, data: UpdateContactInfo) {
    const existingContactInfo = await this.contactRepository.findByStudentId(studentId);

    if (!existingContactInfo) {
      throw new NotFoundError("Contact not found");
    }

    try {
      return await this.contactRepository.updateByStudentId(studentId, data);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Contact not found");
      }
      throw new InternalServerError("Failed to update contact info");
    }
  }

  async deleteContactInfo(id: string) {
    const existingContactInfo = await this.contactRepository.findById(id);

    if (!existingContactInfo) {
      throw new NotFoundError("Contact not found");
    }

    try {
      return await this.contactRepository.deleteById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (isPrismaRecordNotFound(error)) {
        throw new NotFoundError("Contact not found");
      }
      throw new InternalServerError("Failed to delete contact info");
    }
  }
}
