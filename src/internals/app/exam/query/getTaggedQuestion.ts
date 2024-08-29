import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {QuestionWithReason} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";
import {BadRequestError, UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface GetTaggedQuestionsQuery {
    handle: (filter: PaginationFilter) => Promise<{
        questions
            : QuestionWithReason[], metadata: PaginationMetaData
    }>
}

export class GetTaggedQuestionsQueryC implements GetTaggedQuestionsQuery {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{
        questions
            : QuestionWithReason[], metadata: PaginationMetaData
    }> => {
        try {
            if (!filter.examId || filter.examId == "") {
                throw new BadRequestError("pass exam Id")
            }
            if (!filter.userId || filter.userId == "") {
                throw new UnAuthorizedError("try to login")
            }
            const {
                questions
                , metadata
            } = await this.examRepository.GetTaggedQuestions(
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