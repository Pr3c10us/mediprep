import {z} from "zod";
import {uuidSchema} from "./admin";

export const createTestSchema = z.object({
    questions: z.number().default(0),
    questionMode: z.enum(["used", "unused","all"]).default("unused"),
    endTime: z.string().regex(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[+-]\d{2}:\d{2})$/),
    type: z.enum(["subjectBased", "courseBased", "mock"]).default("mock"),
    subjectId: z.string().optional(),
    courseId: z.string().optional()
});

const answerSchema = z.object({
    questionId: uuidSchema,
    option: z.string().optional(),
    answer: z.string().optional(),
    options: z.array(z.string()).optional()
})
export const scoreTestSchema = z.object({
    testId: uuidSchema,
    answers: z.array(answerSchema),
});

export const testIdSchema = z.object({
    testId: z.string(),
});
