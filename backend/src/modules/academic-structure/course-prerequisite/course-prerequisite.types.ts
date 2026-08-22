import { CoursePrerequisite as PrismaCoursePrerequisite } from "../../../generated/prisma/client.js";
import { CoursePrerequisiteQueryInput, CreateCoursePrerequisiteInput } from './course-prerequisite.validator.js';

export type CoursePrerequisiteDto = {
    id: PrismaCoursePrerequisite['id'],
    courseId: PrismaCoursePrerequisite['courseId'],
    prerequisiteId: PrismaCoursePrerequisite['prerequisiteId'],
    createdAt: PrismaCoursePrerequisite['createdAt'],
}

export type { CoursePrerequisiteQueryInput, CreateCoursePrerequisiteInput };