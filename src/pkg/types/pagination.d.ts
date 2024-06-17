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
    examId?: string;

};

export type PaginationMetaData = {
    total: number;
    perPage: number;
    currentPage: number;
};


