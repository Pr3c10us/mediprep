export type Exam = {
    id?: string;
    name: string;
    description: string;
    subscriptionAmount: number;
    imageURL?: string;
    courses?: Course[],
    createdAt?: Date;
    updatedAt?: Date;
};

export type EditExamParams = {
    name?: string;
    description?: string;
    imageURL?: string;
    subscriptionAmount?: number;
};

export type Course = {
    id?: string;
    name: string;
    examId? : string;
    subjects?: Subject[]
}

export type Subject = {
    id?: string;
    name: string;
    courseId?: string;
    questions?: Question[]
}

export type Question = {
    id?: string;
    description: string;
    question: string;
    questionImageUrl?: string;
    explanation: string;
    explanationImageUrl?: string;
    subjectId?: string;
    options?: Option[]
}

export type EditQuestionParams = {
    id? : string;
    description?: string;
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
    explanation? : string;
}

export type EditOptionParams = {
    index: number,
    value?: string,
    answer?: boolean,
    explanation? : string
}
