import { Exam } from "../exams/exam";

export type AdminAccess =
    | "SUPER_ADMIN"
    | "ADMIN"
    | "ADMIN_READ"
    | "SUBSCRIPTION"
    | "EXAM"
    | "EXAM_READ"
    | "USER"
    | "USER_READ";

type AdminRoles = "viewer" | "sales" | "hr" | "examiner" | "admin";

export type Admin = {
    id?: string ;
    name: string ;
    email: string ;
    password?: string;
    roles: AdminRoles[];
    examAccess?: string[];
    createdAt?: Date;
    updatedAt?: Date;
};

export const newAdmin = (
    name: string | null,
    email: string | null,
    roles: string[] | null,
    id?: string | null,
    password?: string | null,
    createdAt?: Date | null,
    updatedAt?: Date | null,
): Admin => {
    return {
        name: name as string,
        email: email as string,
        roles: roles as AdminRoles[],
        id: id as string,
        password: password as string,
        createdAt: createdAt as Date,
        updatedAt: updatedAt as Date,
    };
};
