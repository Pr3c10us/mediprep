import {TestRepository} from "../../../domain/tests/repository";
import {Question, QuestionWithReason} from "../../../domain/exams/exam";
import {BadRequestError, UnAuthorizedError} from "../../../../pkg/errors/customError";
import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";

export interface GetExamQuestions {
    Handle: (filter: PaginationFilter) => Promise<{
        questions
            : QuestionWithReason[], metadata: PaginationMetaData
    }>
}

export class GetExamQuestionsC implements GetExamQuestionsC {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (filter: PaginationFilter): Promise<{
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
            } = await this.testRepositories.GetTestQuestions(
                filter
            );
            console.log(questions)
            return {
                questions
                , metadata
            };
        } catch (error) {
            throw error;
        }
    }

}