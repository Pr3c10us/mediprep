import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Question} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetQuestionsQuery {
    handle: (filter: PaginationFilter) => Promise<{
        questions
            : Question[], metadata: PaginationMetaData
    }>
}

export class GetQuestionsQueryC implements GetQuestionsQuery {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{
        questions
            : Question[], metadata: PaginationMetaData
    }> => {
        try {
            const {
                questions
                , metadata
            } = await this.examRepository.GetQuestions(
                filter
            );
            return {
                questions
                , metadata
            };
        } catch (error) {
            throw error
        }
    };
}
