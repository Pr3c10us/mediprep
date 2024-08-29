import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Question, QuestionBatch} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetQuestionBatch {
    handle: (filter: PaginationFilter) =>  Promise<{questionBatches: QuestionBatch[], metadata: PaginationMetaData}>
}

export class GetQuestionBatchC implements GetQuestionBatch {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter):  Promise<{questionBatches: QuestionBatch[], metadata: PaginationMetaData}> => {
        try {
            return await this.examRepository.GetQuestionBatches(
                filter
            )

        } catch (error) {
            throw error
        }
    };
}
