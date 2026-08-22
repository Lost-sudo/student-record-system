import { prisma } from "../../database/prisma.js";
import { ConflictError, InternalServerError, NotFoundError } from "../../utils/error.utils.js";
import { ContactRepository } from "./contact.repository.js";
import { ContactService } from "./contact.service.js";

jest.mock("../../utils/prisma-error.utils.js", () => ({
  isPrismaKnownRequestError: (error: unknown) => typeof (error as { code?: string } | null)?.code === "string",
  isUniqueConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2002",
  isForeignKeyConstraintViolation: (error: unknown) => (error as { code?: string } | null)?.code === "P2003",
  isPrismaRecordNotFound: (error: unknown) => (error as { code?: string } | null)?.code === "P2025",
}));

jest.mock("../../database/prisma.js", () => ({
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

  it("throws ConflictError if contact info already exists", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.contactInfo.findUnique.mockResolvedValue({ id: "ci-1" });

    const promise = service.createContactInfo("student-123", { email: "test@test.com" });
    await expect(promise).rejects.toThrow(ConflictError);
    await expect(promise).rejects.toThrow("Contact info already exist for this student. Use update instead");
  });

  it("throws NotFoundError if student does not exist", async () => {
    mockPrisma.student.findFirst.mockResolvedValue(null);

    const promise = service.createContactInfo("student-123", { email: "test@test.com" });
    await expect(promise).rejects.toThrow(NotFoundError);
    await expect(promise).rejects.toThrow("Student not found");
  });

  it("throws InternalServerError if create fails unexpectedly", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.contactInfo.findUnique.mockResolvedValue(null);
    mockPrisma.contactInfo.create.mockRejectedValue(new Error("Database connection lost"));

    const promise = service.createContactInfo("student-123", { email: "test@test.com" });
    await expect(promise).rejects.toThrow(InternalServerError);
    await expect(promise).rejects.toThrow("Failed to create contact info");
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

  it("throws NotFoundError if contact does not exist", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

    const promise = service.updateContactInfo("student-123", { phone: "1234567890" });
    await expect(promise).rejects.toThrow(NotFoundError);
    await expect(promise).rejects.toThrow("Contact not found");
  });

  it("throws InternalServerError if update fails unexpectedly", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
    });
    mockPrisma.contactInfo.update.mockRejectedValue(new Error("Database connection lost"));

    const promise = service.updateContactInfo("student-123", { phone: "1234567890" });
    await expect(promise).rejects.toThrow(InternalServerError);
    await expect(promise).rejects.toThrow("Failed to update contact info");
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

  it("throws NotFoundError if contact does not exist", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

    const promise = service.deleteContactInfo("ci-1");
    await expect(promise).rejects.toThrow(NotFoundError);
    await expect(promise).rejects.toThrow("Contact not found");
  });

  it("throws InternalServerError if delete fails unexpectedly", async () => {
    mockPrisma.contactInfo.findUnique.mockResolvedValue({
      id: "ci-1",
      studentId: "student-123",
    });
    mockPrisma.contactInfo.delete.mockRejectedValue(new Error("Database connection lost"));

    const promise = service.deleteContactInfo("ci-1");
    await expect(promise).rejects.toThrow(InternalServerError);
    await expect(promise).rejects.toThrow("Failed to delete contact info");
  });
});
