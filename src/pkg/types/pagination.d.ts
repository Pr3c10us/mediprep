export type PaginationFilter = {
    limit: number;
    page: number;
    name?: string;
    email?: string;
    subjectId?: string;
    courseId? : string;
    examId?: string;
};

export type PaginationMetaData = {
    total: number;
    perPage: number;
    currentPage: number;
};


