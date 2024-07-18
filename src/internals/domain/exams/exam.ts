import {timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {Exams} from "../../../../stack/drizzle/schema/exams";

export type Exam = {
    id?: string;
    name: string;
    description: string;
    subscriptionAmount: number;
    imageURL?: string;
    mockQuestions?: number;
    courses?: Course[],
    createdAt?: Date;
    updatedAt?: Date;
};

export type EditExamParams = {
    name?: string;
    description?: string;
    imageURL?: string;
    subscriptionAmount?: number;
    mockQuestions?: number;
};

export type Course = {
    id?: string;
    name: string;
    examId?: string;
    subjects?: Subject[]
}

export type Subject = {
    id?: string;
    name: string;
    courseId?: string;
    questions?: Question[]
}

export type QuestionType = "singleChoice" | "multiChoice" | "fillInTheGap"
export type QuestionStatus = "correct" | "unanswered" | "wrong";
export type Question = {
    id?: string;
    type: QuestionType;
    question: string;
    questionImageUrl?: string;
    explanation: string;
    explanationImageUrl?: string;
    subjectId?: string;
    questionBatchId?: string;
    options?: Option[];
    questionStatus?: QuestionStatus;
    selectedAnswer?: string | string[]
}

export type EditQuestionParams = {
    id?: string;
    type?: QuestionType;
    question?: string;
    questionImageUrl?: string;
    explanation?: string;
    explanationImageUrl?: string;
    options?: EditOptionParams[]
}

export type Option = {
    id?: string;
    index?: number;
    value: string;
    selected?: number;
    answer?: boolean;
    explanation?: string;
}

export type EditOptionParams = {
    index: number,
    value?: string,
    answer?: boolean,
    explanation?: string
}

export type ExamQuestionFile = { blobName: string, examId: string,batchId: string }

export type QuestionBatchStatus = "processing"|"failed"|"complete";

export type QuestionBatch ={
    id:  string,
    status: QuestionBatchStatus,
    examId:  string,
    createdAt: Date,
    updatedAt: Date,
}