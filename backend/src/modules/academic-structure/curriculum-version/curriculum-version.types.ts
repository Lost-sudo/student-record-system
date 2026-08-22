import { CurriculumVersion as PrismaCurriculumVersion } from "../../../generated/prisma/client.js";
import {
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  CurriculumVersionQueryInput,
} from "./curriculum-version.validator.js";

export type CurriculumVersionDto = {
  id: PrismaCurriculumVersion["id"];
  programId: PrismaCurriculumVersion["programId"];
  effectiveTermId: PrismaCurriculumVersion["effectiveTermId"];
  totalCredits: PrismaCurriculumVersion["totalCredits"];
  description: PrismaCurriculumVersion["description"];
  versionNumber: PrismaCurriculumVersion["versionNumber"];
  isActive: PrismaCurriculumVersion["isActive"];
  createdAt: PrismaCurriculumVersion["createdAt"];
  updatedAt: PrismaCurriculumVersion["updatedAt"];
};

export type {
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  CurriculumVersionQueryInput,
};
