export type PaginationFilter = {
    limit: number;
    page: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profession? : string;
    country? : string;
    subjectId?: string;
    courseId? : string;
    userId?: string;
    examId?: string;
    startDate? : Date;
    endDate? : Date;
    reference?: string;
    status? : string;
    free? : boolean;
    random? : boolean;
};

export type PaginationMetaData = {
    total?: number;
    perPage?: number;
    currentPage?: number;
    expiryDate?: Date,
    totalQuestions?: number
};


