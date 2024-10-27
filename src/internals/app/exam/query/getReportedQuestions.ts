import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import { QuestionWithReason} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";
import {BadRequestError, UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface GetReportedQuestionsQuery {
    Handle: (filter: PaginationFilter) => Promise<{
        questions
            : QuestionWithReason[], metadata: PaginationMetaData
    }>
}

export class GetReportedQuestionsQueryC implements GetReportedQuestionsQuery {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    Handle = async (filter: PaginationFilter): Promise<{
        questions
            : QuestionWithReason[], metadata: PaginationMetaData
    }> => {
        try {
            if (!filter.examId || filter.examId == "") {
                throw new BadRequestError("pass exam Id")
            }
            const {
                questions
                , metadata
            } = await this.examRepository.GetReportedQuestions(
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