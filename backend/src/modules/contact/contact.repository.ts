import { PrismaClient, ContactInfo, Prisma } from "../../generated/prisma/client.js";
import { CreateContactInfo, UpdateContactInfo } from "./contact.types.js";

export class ContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findStudentById(studentId: string) {
    return this.prisma.student.findFirst({
      where: { id: studentId, deletedAt: null },
    });
  }

  async findByStudentId(studentId: string): Promise<ContactInfo | null> {
    return this.prisma.contactInfo.findUnique({
      where: { studentId },
    });
  }

  async findById(id: string): Promise<ContactInfo | null> {
    return this.prisma.contactInfo.findUnique({
      where: { id },
    });
  }

  async create(studentId: string, data: CreateContactInfo): Promise<ContactInfo> {
    return this.prisma.contactInfo.create({
      data: {
        ...data,
        studentId,
      },
    });
  }

  async updateByStudentId(studentId: string, data: UpdateContactInfo): Promise<ContactInfo> {
    return this.prisma.contactInfo.update({
      where: { studentId },
      data,
    });
  }

  async deleteById(id: string): Promise<ContactInfo> {
    return this.prisma.contactInfo.delete({
      where: { id },
    });
  }
}
