export type AdminRole = {
    name: string;
    permissions: Permission[];
};

export const AdminRoles: AdminRole[] = [
    {
        name: "admin",
        permissions: [
            "create_user",
            "read_user",
            "edit_user",
            "create_exam",
            "read_exam",
            "edit_exam",
            "delete_exam",
            "read_sales",
            "create_admin",
            "read_admin",
            "edit_admin",
            "delete_admin",
        ],
    },
    // Able to create, update, and delete exams
    {
        name: "examiner",
        permissions: ["create_exam", "read_exam", "edit_exam", "delete_exam"],
    },
    {
        name: "hr",
        permissions: [
            "create_user",
            "read_user",
            "edit_user",
            "create_admin",
            "read_admin",
            "edit_admin",
        ],
    },
    {
        name: "sales",
        permissions: ["read_sales"],
    },
    // Able to update exams assigned to them
    {
        name: "viewer",
        permissions: ["read_user", "read_exam", "read_sales", "read_admin"],
    },
];

export class Roles {
    static roles: AdminRole[] = AdminRoles;

    static getRoleByName(name: string): AdminRole | undefined {
        return this.roles.find((role) => role.name === name);
    }
}

export type Permission =
    | "create_user"
    | "read_user"
    | "edit_user"
    | "create_exam"
    | "read_exam"
    | "edit_exam"
    | "delete_exam"
    | "read_sales"
    | "create_admin"
    | "read_admin"
    | "edit_admin"
    | "delete_admin";
