export type AdminAccess =
    | "SUPER_ADMIN"
    | "ADMIN"
    | "ADMIN_READ"
    | "SUBSCRIPTION"
    | "EXAM"
    | "EXAM_READ"
    | "USER"
    | "USER_READ";

export type Admin = {
    id?: string;
    name: string;
    email: string;
    roles: string[];
    examAccess: string[];
    createdAt?: Date;
    updated_at?: Date;
};

