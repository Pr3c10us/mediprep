import {number, z} from "zod";
import {uuidSchema} from "./admin";

export const getSalesFilterSchema = z.object({
    reference: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
});

export const saleIdSchema = z.object({
    id: uuidSchema
})

export const addSaleSchema = z.object({
    userID: uuidSchema,
    examID: uuidSchema,
    months: z.number(),
})