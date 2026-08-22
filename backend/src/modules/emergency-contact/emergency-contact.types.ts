import { Prisma } from "../../generated/prisma/client.js";
import { CreateEmergencyContactInput, UpdateEmergencyContactInput } from "./emergency-contact.validator.js";

export type EmergencyContactDto = Prisma.EmergencyContactGetPayload<{}>;

export type CreateEmergencyContactBody = CreateEmergencyContactInput;
export type UpdateEmergencyContactBody = UpdateEmergencyContactInput;

// Backward-compatible aliases for older imports.
export type CreateStudentEmergencyContact = CreateEmergencyContactBody;
export type UpdateStudentEmergencyContact = UpdateEmergencyContactBody;
