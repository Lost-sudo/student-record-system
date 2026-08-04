import { prisma } from "../../database/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { ContactRepository } from "./contact.repository";
import { ContactService } from "./contact.service";

jest.mock("../../database/prisma", () => ({
  prisma: {
    student: {
      findFirst: jest.fn(),
    },
    contactInfo: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as unknown as {
  student: { findFirst: jest.Mock };
  contactInfo: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

describe("Contact Information Service", () => {
  let service: ContactService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ContactService(new ContactRepository(prisma as never));
  });

  it("returns contact info by student id", async () => {
    const contact = { id: "ci-1", studentId: "student-123", email: "test@test.com" };
    mockPrisma.contactInfo.findUnique.mockResolvedValue(contact);

    await expect(service.getContactInfoByStudentId("student-123")).resolves.toEqual(contact);
  });

  it("creates contact info for an existing student", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.contactInfo.findUnique.mockResolvedValue(null);
    mockPrisma.contactInfo.create.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
      email: "test@test.com",
      phone: "1234567890",
    });

    const result = await service.createContactInfo("student-123", {
      email: "test@test.com",
      phone: "1234567890",
    });

    expect(result.studentId).toBe("student-123");
    expect(mockPrisma.contactInfo.create).toHaveBeenCalledWith({
      data: {
        email: "test@test.com",
        phone: "1234567890",
        studentId: "student-123",
      },
    });
  });

  it("throws if contact info already exists", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.contactInfo.findUnique.mockResolvedValue({ id: "ci-1" });

    await expect(
      service.createContactInfo("student-123", { email: "test@test.com" })
    ).rejects.toThrow("Contact info already exist for this student. Use update instead");
  });

  it("updates existing contact info by student id", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
    });
    mockPrisma.contactInfo.update.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
      phone: "1234567890",
    });

    await expect(
      service.updateContactInfo("student-123", { phone: "1234567890" })
    ).resolves.toMatchObject({ phone: "1234567890" });
  });

  it("deletes contact info by id", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
    });
    mockPrisma.contactInfo.delete.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
    });

    await expect(service.deleteContactInfo("ci-1")).resolves.toMatchObject({
      id: "ci-1",
    });
  });
});
