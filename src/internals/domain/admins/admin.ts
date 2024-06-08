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
    createdAt?: Date;
    updatedAt?: Date;
};

export const newAdmin = (
    name: string,
    email: string,
    roles: AdminRoles[],
    id?: string,
    password?: string,
    examAccess?: string[],
    createdAt?: Date,
    updatedAt?: Date
): Admin => {
    return {
        name: name,
        email: email,
        roles: roles,
        id: id,
        password: password,
        examAccess: examAccess,
        createdAt: createdAt,
        updatedAt: updatedAt,
    };
};
