import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {UserExamAccessRepository} from "../../../domain/examAccess/repository";
import {Exam} from "../../../domain/exams/exam";

export interface GetUserExamsQuery {
    handle: (filter: PaginationFilter) => Promise<{ exams: Exam[], metadata: PaginationMetaData }>
}

export class GetUserExamsQueryC implements GetUserExamsQuery {
    userExamAccessRepository: UserExamAccessRepository;

    constructor(userExamAccessRepository: UserExamAccessRepository) {
        this.userExamAccessRepository = userExamAccessRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ exams: Exam[], metadata: PaginationMetaData }> => {
        try {
            const {exams, metadata} = await this.userExamAccessRepository.getExams(
                filter
            );
            return {exams, metadata};
        } catch (error) {
            throw error
        }
    };
}
