import {QuestionStatus, QuestionType} from "../exams/exam";

export type TestType = "subjectBased" | "courseBased" | "mock"
export type TestMode = "used" | "unused" | "all"

export type Test = {
    id: string;
    status: string;
    score: number;
    questions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unansweredQuestions: number;
    type: TestType
    questionMode: TestMode;
    userId: string;
    subjectIds: string[];
    courseIds: string[];
    examId: string;
    endTime: Date;
    createdAt: Date;
    updatedAt: Date;
    timeLeft?: number;
    testQuestions?: TestQuestion[]
}

export type UserQuestions = {
    id: string;
    userId: string;
    questionId: string;
    subjectId: string;
    courseId: string;
    examId: string;
}

export type TestQuestion = {
    id: string;
    questionType: QuestionType
    questionStatus: QuestionStatus
    testId: string;
    userId: string;
    optionId: string;
    questionId: string;
    subjectId: string;
    courseId: string;
    examId: string;
}

export type UserAnswer = {
    questionId: string,
    option?: string
    answer?: string
    options?: string[]
}

export type TestAnalytics = {
    totalQuestions: number,
    usedQuestions: number,
    totalTest: number,
    testAveragePercent: number,
    totalMocks: number,
    mockAveragePercent: number,
}

export type SubmittedQuestion = {
    questionStatus: string,
    questionType: string,
    questionId: string
}
