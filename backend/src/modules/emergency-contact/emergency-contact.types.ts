import { Prisma } from "../../generated/prisma/client";
import { CreateEmergencyContactInput, UpdateEmergencyContactInput } from "./emergency-contact.validator";

export type EmergencyContactDto = Prisma.EmergencyContactGetPayload<{}>;

export type CreateEmergencyContactBody = CreateEmergencyContactInput;
export type UpdateEmergencyContactBody = UpdateEmergencyContactInput;

// Backward-compatible aliases for older imports.
export type CreateStudentEmergencyContact = CreateEmergencyContactBody;
export type UpdateStudentEmergencyContact = UpdateEmergencyContactBody;
