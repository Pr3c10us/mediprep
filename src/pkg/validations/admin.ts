import { z } from "zod";

export const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

enum Roles {
    VIEWER = "viewer",
    SALES = "sales",
    HR = "hr",
    EXAMINER = "examiner",
    ADMIN = "admin",
}

const rolesEnumSchema = z.nativeEnum(Roles);
export const uuidSchema = z.string().uuid();

export const addAdminSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*)."
        )
        .optional(),
    roles: z.array(rolesEnumSchema),
    examAccess: z.array(uuidSchema).optional(),
});

export const authenticateAdminSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const getAdminsFilterSchema = z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
});
