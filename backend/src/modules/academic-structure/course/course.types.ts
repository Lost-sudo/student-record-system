import { Course as PrismaCourse } from "../../../generated/prisma/client";
import { CourseQueryInput, CreateCourseInput, UpdateCourseInput } from './course.validator';

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