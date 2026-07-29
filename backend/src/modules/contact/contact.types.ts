import { Prisma } from "../../generated/prisma/client";

export type CreateContactInfo = Omit<Prisma.ContactInfoCreateInput, "student">;

export type UpdateContactInfo = Prisma.ContactInfoUpdateInput;