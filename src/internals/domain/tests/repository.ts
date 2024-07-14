import {Test, UserAnswer} from "./test";
import {Question} from "../exams/exam";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface TestRepository {
    getTests: (filter: PaginationFilter) => Promise<{ tests: Test[]; metadata: PaginationMetaData }>
    CreateTest: (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">) => Promise<string>
    getTestQuestions: (testId: string, userId: string) => Promise<Question[]>
    scoreTest: (testId: string, userId: string, answers: UserAnswer[]) => Promise<string>
}