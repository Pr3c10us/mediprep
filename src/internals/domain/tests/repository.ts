import {Test, TestAnalytics, UserAnswer} from "./test";
import {Question} from "../exams/exam";
import {PaginationFilter, PaginationMetaData} from "../../../pkg/types/pagination";

export interface TestRepository {
    getTests: (filter: PaginationFilter) => Promise<{ tests: Test[]; metadata: PaginationMetaData }>
    CreateTest: (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">) => Promise<{testId: string,endTime:Date}>
    getTestQuestions: (testId: string, userId: string) => Promise<Question[]>
    scoreTest: (testId: string, userId: string, answers: UserAnswer[]) => Promise<string>
    getExamTestAnalytics: (userId: string, examId: string) => Promise<TestAnalytics>
    getTestAnalytics: (testId: string, userId: string) => Promise<{
        test: Test,
        questions: Question[]
    }>
    pauseTestStatus: (testId: string, userId: string) => Promise<void>
    resumeTestStatus: (testId: string, userId: string) => Promise<{ testId: string, timeLeft: number }>
    endTest: (testId: string, userId: string) => Promise<void>
    forceEndTest: (testId: string) => Promise<void>
}