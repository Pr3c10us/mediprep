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

export const getCommandFilterSchema = z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    name: z.string().optional(),
});


export const courseSchema = z.object({
    name: z.string(),
    examId: uuidSchema
});

export const editCourseSchema = z.object({
    name: z.string()
});

export const courseIdSchema = z.object({
    courseId: uuidSchema
})

export const subjectSchema = z.object({
    name: z.string(),
    courseId: uuidSchema
});

export const editSubjectSchema = z.object({
    name: z.string()
});

export const subjectIdSchema = z.object({
    subjectId: uuidSchema
})