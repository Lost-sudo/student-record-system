import { ContactService} from "./contact.service";
import {prisma} from "../../database/prisma";
import {AppError} from "../../middlewares/error.middleware";

jest.mock("../../database/prisma", () => ({
    prisma: {
        student: {
            findUnique: jest.fn(),
        },
        contactInfo: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    }
}));

const mockPrisma = prisma as unknown as {
    student: {
        findUnique: jest.Mock,
    },
    contactInfo: {
        findUnique: jest.Mock,
        create: jest.Mock,
        update: jest.Mock,
        delete: jest.Mock,
    }
};

describe("Contact Information Service", () => {
    let contactInfoService : ContactService;

    beforeEach(() => {
        jest.clearAllMocks();
        contactInfoService = new ContactService();
    });

    describe('getContactInfoByStudentId', () => {
        it('should return contact info if it exist', async () => {
            const mockContactInfo = { id: "ci-1", studentId: "student-123", email: "test@test.com" };
            mockPrisma.contactInfo.findUnique.mockResolvedValue(mockContactInfo);

            const result = await contactInfoService.getContactInfoByStudentId('student-123');

            expect(result).toEqual(mockContactInfo);
            expect(mockPrisma.contactInfo.findUnique).toHaveBeenCalledWith({
                where: { studentId: 'student-123' },
            })
        });

        it('should return null if contact info does not exist', async () => {
            mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

            const result = await contactInfoService.getContactInfoByStudentId('student-123');
            expect(result).toEqual(null);
        });
    });

    describe('createContactInfo', () => {
        const studentId = "student-123";
        const contactData = { email: "test@test.com", phone: "1234567890" }

        it('should throw AppError if student does not exist', async () => {
            mockPrisma.student.findUnique.mockResolvedValue(null);

            await expect(contactInfoService.createContactInfo(studentId, contactData)).rejects.toThrow(AppError);
        });

        it('should throw throw AppError if contact info already exist', async () => {
            mockPrisma.student.findUnique.mockResolvedValue({ id: studentId });
            mockPrisma.contactInfo.findUnique.mockResolvedValue({ id: "ci-1", studentId: studentId });

            await expect(contactInfoService.createContactInfo(studentId, contactData)).rejects.toThrow(AppError);
        });

        it('should create and return contact info if validation pass',  async () => {
            mockPrisma.student.findUnique.mockResolvedValue({ id: studentId });
            mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

            const mockCreated = { id: "ci-1", studentId, ...contactData };
            mockPrisma.contactInfo.create.mockResolvedValue(mockCreated);

            const result = await contactInfoService.createContactInfo(studentId, contactData);

            expect(result).toEqual(mockCreated);
            expect(mockPrisma.contactInfo.create).toHaveBeenCalledWith({
                data: { ...contactData, studentId }
            });
        });
    })

    describe('updateContactInfo', () => {
        const studentId = "student-123";
        const updateData = { phone: "1234567890" };
        const existingContact = { id: "ci-1", studentId, email: "test@test.com", phone: "0987654321" };

        it('should throw AppError if contact info does not exist', async () => {
            mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

            await expect(contactInfoService.updateContactInfo(studentId, updateData)).rejects.toThrow(AppError);
        });

        it('should update and return contact info if it exists', async () => {
            mockPrisma.contactInfo.findUnique.mockResolvedValue(existingContact);

            const mockUpdated = { ...existingContact, ...updateData };
            mockPrisma.contactInfo.update.mockResolvedValue(mockUpdated);

            const result = await contactInfoService.updateContactInfo(studentId, updateData);

            expect(result).toEqual(mockUpdated);
            expect(mockPrisma.contactInfo.update).toHaveBeenCalledWith({
                where: { studentId: studentId },
                data: updateData,
            })
        });
    });

    describe('deleteContactInfo', () => {
        const studentId = "student-123";
        const existingContact = { id: "ci-1", studentId, email: "test@test.com" };

        it('should throw AppError if contact info does not exist', async () => {
            mockPrisma.contactInfo.findUnique.mockResolvedValue(null);

            await expect(contactInfoService.deleteContactInfo(studentId)).rejects.toThrow(AppError);
        });

        it('should delete and return contact info it it exist', async () => {
            mockPrisma.contactInfo.findUnique.mockResolvedValue(existingContact);
            mockPrisma.contactInfo.delete.mockResolvedValue(existingContact);

            const result = await contactInfoService.deleteContactInfo(studentId);

            expect(result).toEqual(existingContact);
            expect(mockPrisma.contactInfo.delete).toHaveBeenCalledWith({
                where: { studentId: studentId },
            })
        });
    })
})