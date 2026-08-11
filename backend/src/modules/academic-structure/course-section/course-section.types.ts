import { CourseSection as PrismaCourseSection } from "../../../generated/prisma/client";
import {
  CourseSectionQueryInput,
  CreateCourseSectionInput,
  UpdateCourseSectionInput,
} from "./course-section.validator";

export type CourseSectionDto = {
  id: PrismaCourseSection["id"];
  courseId: PrismaCourseSection["courseId"];
  termId: PrismaCourseSection["termId"];
  sectionNumber: PrismaCourseSection["sectionNumber"];
  capacity: PrismaCourseSection["capacity"];
  enrolledCount: PrismaCourseSection["enrolledCount"];
  createdAt: PrismaCourseSection["createdAt"];
  updatedAt: PrismaCourseSection["updatedAt"];
};

export type {
  CourseSectionQueryInput,
  CreateCourseSectionInput,
  UpdateCourseSectionInput,
};
