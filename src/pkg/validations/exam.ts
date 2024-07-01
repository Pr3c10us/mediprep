import {z} from "zod";
import {uuidSchema} from "./admin";

export const addExamSchema = z.object({
    name: z.string(),
    description: z.string(),
    subscriptionAmount: z.number(),
    mockQuestions: z.number()
});

export const editExamSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    subscriptionAmount: z.number().optional(),
    mockQuestions: z.number().optional()
});

export const examIdSchema = z.object({
    id: uuidSchema
})

export const getCommandFilterSchema = z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    profession : z.string().optional(),
    country : z.string().optional(),
    subjectId: uuidSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
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


const optionSchema = z.object({
    value: z.string(),
    answer: z.boolean(),
    explanation: z.string()
})

export const questionSchema = z.object({
    description: z.string(),
    question: z.string(),
    explanation: z.string(),
    subjectId: uuidSchema,
    options: z.array(optionSchema).min(1)
})

const editOptionSchema = z.object({
    index: z.number(),
    value: z.string().optional(),
    answer: z.boolean().optional(),
    explanation: z.string().optional()
})

export const editQuestionSchema = z.object({
    description: z.string().optional(),
    question: z.string().optional(),
    explanation: z.string().optional(),
    options: z.array(editOptionSchema).optional()
})

export const questionIdSchema = z.object({
    questionId: uuidSchema
})