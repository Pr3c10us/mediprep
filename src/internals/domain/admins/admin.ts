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
    id?: string;
    name: string;
    email: string;
    password?: string;
    roles: AdminRoles[];
    examAccess?: string[];
    exams?: Exam[];
    createdAt?: Date;
    updatedAt?: Date;
};

export const newAdmin = (
    name: string,
    email: string,
    roles: AdminRoles[],
    id?: string,
    password?: string,
    createdAt?: Date,
    updatedAt?: Date,
    exams?: Exam[]
): Admin => {
    return {
        name: name,
        email: email,
        roles: roles,
        id: id,
        password: password,
        createdAt: createdAt,
        updatedAt: updatedAt,
        exams: exams,
    };
};
