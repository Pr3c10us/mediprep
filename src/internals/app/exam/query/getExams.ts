import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Exam} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetExamsQuery {
    handle: (filter: PaginationFilter) => Promise<{ exams: Exam[], metadata: PaginationMetaData }>
}

export class GetExamsQueryC implements GetExamsQuery{
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ exams: Exam[], metadata: PaginationMetaData }> => {
        try {
            const {exams, metadata} = await this.examRepository.GetExams(
                filter
            );
            return {exams, metadata};
        } catch (error) {
            throw error
        }
    };
}
