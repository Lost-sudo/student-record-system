import { CurriculumVersion as PrismaCurriculumVersion } from "../../../generated/prisma/client";
import {
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  CurriculumVersionQueryInput,
} from "./curriculum-version.validator";

export type CurriculumVersionDto = {
  id: PrismaCurriculumVersion["id"];
  programId: PrismaCurriculumVersion["programId"];
  effectiveTermId: PrismaCurriculumVersion["effectiveTermId"];
  totalCredits: PrismaCurriculumVersion["totalCredits"];
  description: PrismaCurriculumVersion["description"];
  isActive: PrismaCurriculumVersion["isActive"];
  createdAt: PrismaCurriculumVersion["createdAt"];
  updatedAt: PrismaCurriculumVersion["updatedAt"];
};

export type {
  CreateCurriculumVersionInput,
  UpdateCurriculumVersionInput,
  CurriculumVersionQueryInput,
};
