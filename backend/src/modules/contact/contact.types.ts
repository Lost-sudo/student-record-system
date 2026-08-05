import { Prisma } from "../../generated/prisma/client";
import { CreateContactInformationInput, UpdateContactInformationInput } from "./contact.validator";

export type ContactInfoDto = Prisma.ContactInfoGetPayload<{}>;

export type CreateContactInfo = CreateContactInformationInput;
export type UpdateContactInfo = UpdateContactInformationInput;
