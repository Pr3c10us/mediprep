import {z} from "zod";
import {passwordRegex, uuidSchema} from "./admin";

export const userIdSchema = z.object({
    id: uuidSchema
})

export const verifyJwtSchema = z.object({
    jwt: z.string()
})

export const userSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must be at least 8 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*)."
        ),
    profession: z.string(),
    country: z.string(),
})