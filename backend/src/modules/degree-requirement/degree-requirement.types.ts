import { DegreeRequirement as PrismaDegreeRequirement } from "../../generated/prisma/client";
import {
  CreateDegreeRequirementInput,
  UpdateDegreeRequirementInput,
  DegreeRequirementQueryInput,
} from "./degree-requirement.validator";

export type DegreeRequirementDto = {
  id: PrismaDegreeRequirement["id"];
  curriculumId: PrismaDegreeRequirement["curriculumId"];
  requirementType: PrismaDegreeRequirement["requirementType"];
  minCredits: PrismaDegreeRequirement["minCredits"];
  courseId: PrismaDegreeRequirement["courseId"];
  createdAt: PrismaDegreeRequirement["createdAt"];
  updatedAt: PrismaDegreeRequirement["updatedAt"];
};

export type {
  CreateDegreeRequirementInput,
  UpdateDegreeRequirementInput,
  DegreeRequirementQueryInput,
};
