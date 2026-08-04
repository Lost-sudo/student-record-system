import { PrismaClient, EmergencyContact } from "../../generated/prisma/client";
import { CreateStudentEmergencyContact, UpdateStudentEmergencyContact } from "./emergency-contact.types";

export class EmergencyContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  transaction<T>(callback: Parameters<PrismaClient["$transaction"]>[0]) {
    return this.prisma.$transaction(callback as never);
  }

  async findStudentById(studentId: string) {
    return this.prisma.student.findFirst({
      where: { id: studentId, deletedAt: null },
    });
  }

  async create(studentId: string, data: CreateStudentEmergencyContact): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.create({
      data: {
        ...data,
        studentId,
      },
    });
  }

  async findByStudentId(studentId: string): Promise<EmergencyContact[]> {
    return this.prisma.emergencyContact.findMany({
      where: { studentId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
  }

  async findById(contactId: string): Promise<EmergencyContact | null> {
    return this.prisma.emergencyContact.findUnique({
      where: { id: contactId },
    });
  }

  async demoteOtherPrimaryContacts(studentId: string, contactId?: string) {
    return this.prisma.emergencyContact.updateMany({
      where: {
        studentId,
        isPrimary: true,
        ...(contactId ? { id: { not: contactId } } : {}),
      },
      data: { isPrimary: false },
    });
  }

  async update(contactId: string, data: UpdateStudentEmergencyContact): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.update({
      where: { id: contactId },
      data,
    });
  }

  async delete(contactId: string): Promise<EmergencyContact> {
    return this.prisma.emergencyContact.delete({
      where: { id: contactId },
    });
  }

  async findOldestByStudentId(studentId: string): Promise<EmergencyContact | null> {
    return this.prisma.emergencyContact.findFirst({
      where: { studentId },
      orderBy: { createdAt: "asc" },
    });
  }
}
