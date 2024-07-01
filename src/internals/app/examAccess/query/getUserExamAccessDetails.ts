import {PaginationMetaData} from "../../../../pkg/types/pagination";
import {UserExamAccessRepository} from "../../../domain/examAccess/repository";
import {Exam} from "../../../domain/exams/exam";

export interface GetUseExamDetailsQuery {
    handle: (userId: string, examId: string) => Promise<{
        exam: Exam,
        metadata: PaginationMetaData
    }>
}

export class GetUseExamDetailsQueryC implements GetUseExamDetailsQuery {
    userExamAccessRepository: UserExamAccessRepository;

    constructor(userExamAccessRepository: UserExamAccessRepository) {
        this.userExamAccessRepository = userExamAccessRepository;
    }

    handle = async (userId: string, examId: string): Promise<{
        exam: Exam,
        metadata: PaginationMetaData
    }> => {
        try {
            const {exam, metadata} = await this.userExamAccessRepository.getExamAccessDetail(
                userId, examId
            );
            return {exam, metadata};
        } catch (error) {
            throw error
        }
    };
}