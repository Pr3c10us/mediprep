export type AdminRole = {
    name: string;
    permissions: string[];
};

export const AdminRoles: AdminRole[] = [
    {
        name: "admin",
        permissions: [
            "create_user",
            "read_user",
            "update_user",
            "create_exam",
            "read_exam",
            "update_exam",
            "delete_exam",
            "read_sales",
            "create_admin",
            "read_admin",
            "update_admin",
            "delete_admin",
        ],
    },
    // Able to create, update, and delete exams
    {
        name: "examiner",
        permissions: ["create_exam", "read_exam", "update_exam", "delete_exam"],
    },
    {
        name: "hr",
        permissions: [
            "create_user",
            "read_user",
            "update_user",
            "create_admin",
            "read_admin",
            "update_admin",
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
    roles: AdminRole[] = AdminRoles;

    getRoleByName(name: string): AdminRole | undefined {
        return this.roles.find((role) => role.name === name);
    }

    getRoles(): AdminRole[] {
        return this.roles;
    }
}
