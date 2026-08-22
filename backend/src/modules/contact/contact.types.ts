import { Prisma } from "../../generated/prisma/client.js";
import { CreateContactInformationInput, UpdateContactInformationInput } from "./contact.validator.js";

export type ContactInfoDto = Prisma.ContactInfoGetPayload<{}>;

export type CreateContactInfo = CreateContactInformationInput;
export type UpdateContactInfo = UpdateContactInformationInput;
