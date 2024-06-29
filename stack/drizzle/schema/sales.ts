import {bigint, pgTable, primaryKey, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {Users} from "./users";
import {Exams} from "./exams";
import {relations} from "drizzle-orm";

export const Sales = pgTable('sale', {
    id: uuid('id').defaultRandom(),
    reference: varchar('reference', {length: 128}),
    amount: bigint('amount', {mode: 'number'}).default(0),
    expiryDate: timestamp('expiry_date'),
    email: varchar('email', {length: 128}),
    status: varchar('status', {length: 64}).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
    userId: uuid('user_id').references(() => Users.id),
    examId: uuid('exam_id').references(() => Exams.id),
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const salesRelation = relations(Sales, ({one}) => ({
    exam: one(Exams, {
        fields: [Sales.examId],
        references: [Exams.id]
    }),
    user: one(Users, {
        fields: [Sales.userId],
        references: [Users.id]
    }),
}))