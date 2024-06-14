export type Exam = {
    id?: string;
    name: string;
    description: string;
    imageURL?: string;
    courses?: Course[],
    createdAt?: Date;
    updatedAt?: Date;
};

export type EditExamParams = {
    name?: string;
    description?: string;
    imageURL?: string;
};

export type Course = {
    id?: string;
    name: string;
    subjects?: Subject[]
}

export type Subject = {
    id?: string;
    name: string;
    questions?: Question[]
}

export type Question = {
    id?: string;
    description: string;
    question: string;
    questionImageUrl: string;
    explanation: string;
    explanationImageUrl: string;
    options?: Option[]
}

export type EditQuestionParams = {
    description?: string;
    question?: string;
    questionImageUrl?: string;
    explanation?: string;
    explanationImageUrl?: string;
    options?: EditOptionParams[]
}

export type Option = {
    index?: number;
    value: string;
    selected?: number;
    answer?: boolean;
}

export type EditOptionParams = {
    index: number,
    value?: string,
    answer?: boolean
}
