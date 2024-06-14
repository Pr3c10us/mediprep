export type PaginationFilter = {
    limit: number;
    page: number;
    name?: string;
    email?: string;
};

export type PaginationMetaData = {
    total: number;
    perPage: number;
    currentPage: number;
};


