import {z} from "zod";
import {uuidSchema} from "./admin";

export const addItemSchema = z.object({
    months: z.number(),
    examID: uuidSchema,
})

export const removeItemSchema = z.object({
    itemID: uuidSchema,
})