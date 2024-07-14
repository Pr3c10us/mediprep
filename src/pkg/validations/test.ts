import {z} from "zod";
import {uuidSchema} from "./admin";

export const createTestSchema = z.object({
    questions: z.number().default(0),
    questionMode: z.enum(["used", "unused"]).default("unused"),
    endTime: z.date(),
    type: z.enum(["subjectBased", "courseBased", "mock"]).default("mock"),
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
