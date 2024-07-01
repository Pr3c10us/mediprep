import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";
import {Exam} from "../exams/exam";
import {UserExamAccess} from "../users/user";

export interface UserExamAccessRepository {
    getExams : (filter: PaginationFilter) => Promise<{exams: Exam[], metadata: PaginationMetaData}>
    getExamAccessDetail: (userId: string,examId: string) => Promise<{ exam: Exam,metadata: PaginationMetaData }>
}