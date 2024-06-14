import {z} from "zod";
import {uuidSchema} from "./admin";

export const addExamSchema = z.object({
    name: z.string(),
    description: z.string(),
});

export const editExamSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
});

export const examIdSchema = z.object({
    id: uuidSchema
})