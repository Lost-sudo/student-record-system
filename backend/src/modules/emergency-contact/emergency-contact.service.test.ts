import { prisma } from "../../database/prisma.js";
import { NotFoundError } from "../../utils/error.utils.js";
import { EmergencyContactRepository } from "./emergency-contact.repository.js";
import { EmergencyContactService } from "./emergency-contact.service.js";

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
    emergencyContact: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(prisma)),
  },
}));

const mockPrisma = prisma as unknown as {
  student: { findFirst: jest.Mock };
  emergencyContact: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    delete: jest.Mock;
  };
  $transaction: jest.Mock;
};

describe("Emergency Contact Service", () => {
  let service: EmergencyContactService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmergencyContactService(new EmergencyContactRepository(prisma as never));
  });

  it("throws NotFoundError when student does not exist", async () => {
    mockPrisma.student.findFirst.mockResolvedValue(null);

    const promise = service.createEmergencyContact("student-123", {
      name: "Jane Doe",
      relationship: "Mother",
      phone: "1234567890",
      isPrimary: false,
    });
    await expect(promise).rejects.toThrow(NotFoundError);
    await expect(promise).rejects.toThrow("Student not found");
  });

  it("creates a non-primary emergency contact", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.emergencyContact.create.mockResolvedValue({
      id: "ec-1",
      studentId: "student-123",
      isPrimary: false,
    });

    await expect(
      service.createEmergencyContact("student-123", {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "1234567890",
        isPrimary: false,
      })
    ).resolves.toMatchObject({ isPrimary: false });
  });

  it("promotes a primary emergency contact through a transaction", async () => {
    mockPrisma.student.findFirst.mockResolvedValue({ id: "student-123" });
    mockPrisma.emergencyContact.create.mockResolvedValue({
      id: "ec-2",
      studentId: "student-123",
      isPrimary: true,
    });

    await expect(
      service.createEmergencyContact("student-123", {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "1234567890",
        isPrimary: true,
      })
    ).resolves.toMatchObject({ isPrimary: true });

    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });
});
