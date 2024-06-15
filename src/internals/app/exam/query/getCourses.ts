import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Course} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetCoursesQuery {
    handle: (filter: PaginationFilter) => Promise<{ courses: Course[], metadata: PaginationMetaData }>
}

export class GetCoursesQueryC implements GetCoursesQuery{
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ courses: Course[], metadata: PaginationMetaData }> => {
        try {
            const {courses, metadata} = await this.examRepository.GetCourses(
                filter
            );
            return {courses, metadata};
        } catch (error) {
            throw error
        }
    };
}
