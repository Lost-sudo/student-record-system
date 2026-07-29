import {EmergencyContactService} from "./emergency.service";
import { prisma } from "../../database/prisma";
import {AppError} from "../../middlewares/error.middleware";

jest.mock("../../database/prisma", () => ({
    prisma: {
        student: {
            findUnique: jest.fn(),
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

        $transaction: jest.fn().mockImplementation(async (callback) => {
            return callback(prisma)
        })
    }
}));

const mockPrisma = prisma as unknown as {
    student: {
        findUnique: jest.Mock,
    },
    emergencyContact: {
        create: jest.Mock,
        findMany: jest.Mock,
        findUnique: jest.Mock,
        findFirst: jest.Mock,
        update: jest.Mock,
        updateMany: jest.Mock,
        delete: jest.Mock,
    },

    $transaction: jest.Mock,
};

describe("Emergency Contact Service", () => {
    let emergencyContactService: EmergencyContactService;

    beforeEach(() => {
        jest.clearAllMocks();
        emergencyContactService = new EmergencyContactService();
        mockPrisma.$transaction.mockImplementation((callback: (tx: any) => any) => { return callback(prisma) })
    });

    describe("createEmergencyContact", () => {
        const studentId = "student-123";
        const contactData = { name: "Jane Doe", relationship: "Mother", phone: "1234567890" };

        it("should throw AppError (404) if student does not exist", async () => {
            mockPrisma.student.findUnique.mockResolvedValue(null);

            await expect(emergencyContactService.createEmergencyContact(studentId, contactData)).rejects.toThrow(AppError);
        });

        it("should create a non-primary contact without using a transaction", async () => {
            mockPrisma.student.findUnique.mockResolvedValue({ id: studentId });
            mockPrisma.emergencyContact.create.mockResolvedValue({ id: 'c1', ...contactData, isPrimary: false});

            const result = await emergencyContactService.createEmergencyContact(studentId, { ...contactData, isPrimary: false });

            expect(result.isPrimary).toBe(false);
            expect(mockPrisma.emergencyContact.create).toHaveBeenCalled();
            expect(mockPrisma.$transaction).not.toHaveBeenCalled();
        });

        it("should create a primary contact and demote existing primaries using transaction", async () => {
            mockPrisma.student.findUnique.mockResolvedValue({ id: studentId });

            const newContact = {id: 'c2', ...contactData, isPrimary: true};
            mockPrisma.emergencyContact.create.mockResolvedValue(newContact);
            mockPrisma.emergencyContact.updateMany.mockResolvedValue({ count: 1 });

            const result = await emergencyContactService.createEmergencyContact(studentId, { ...contactData, isPrimary: true });

            expect(result.isPrimary).toBe(true);
            expect(mockPrisma.$transaction).toHaveBeenCalled();
            expect(mockPrisma.emergencyContact.updateMany).toHaveBeenCalledWith({
                where: { studentId, isPrimary: true },
                data: { isPrimary: false },
            });
            expect(mockPrisma.emergencyContact.create).toHaveBeenCalledWith({
                data: { ...contactData, studentId, isPrimary: true },
            });
        })
    })
})