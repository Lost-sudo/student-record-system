import { prisma } from "../../database/prisma";
import { AppError } from "../../middlewares/error.middleware";
import { EmergencyContactRepository } from "./emergency-contact.repository";
import { EmergencyContactService } from "./emergency-contact.service";

jest.mock("../../database/prisma", () => ({
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

  it("throws when student does not exist", async () => {
    mockPrisma.student.findFirst.mockResolvedValue(null);

    await expect(
      service.createEmergencyContact("student-123", {
        name: "Jane Doe",
        relationship: "Mother",
        phone: "1234567890",
        isPrimary: false,
      })
    ).rejects.toThrow(AppError);
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
