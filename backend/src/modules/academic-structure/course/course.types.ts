import { Course as PrismaCourse } from "../../../generated/prisma/client.js";
import { CourseQueryInput, CreateCourseInput, UpdateCourseInput } from './course.validator.js';

export type CourseDto = {
    id: PrismaCourse['id'];
    courseCode: PrismaCourse['courseCode'];
    title: PrismaCourse['title'];
    description: PrismaCourse['description'];
    defaultCredits: PrismaCourse['defaultCredits'];
    isActive: PrismaCourse['isActive'];
    createdAt: PrismaCourse['createdAt'];
    updatedAt: PrismaCourse['updatedAt'];
}

export type {
    CourseQueryInput,
    CreateCourseInput,
    UpdateCourseInput
};