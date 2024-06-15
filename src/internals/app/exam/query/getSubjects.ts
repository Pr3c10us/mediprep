import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Subject} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetSubjectsQuery {
    handle: (filter: PaginationFilter) => Promise<{
        subjects
            : Subject[], metadata: PaginationMetaData
    }>
}

export class GetSubjectsQueryC implements GetSubjectsQuery {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{
        subjects
            : Subject[], metadata: PaginationMetaData
    }> => {
        try {
            const {
                subjects
                , metadata
            } = await this.examRepository.GetSubjects(
                filter
            );
            return {
                subjects
                , metadata
            };
        } catch (error) {
            throw error
        }
    };
}
