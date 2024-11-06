import {
    decimal,
    doublePrecision,
    integer,
    pgTable,
    primaryKey,
    timestamp,
    uuid,
    varchar
} from "drizzle-orm/pg-core";
import { Users } from "./users";
import { Exams } from "./exams";
import { InferSelectModel, relations } from "drizzle-orm";

export const Sales = pgTable('sale', {
    id: uuid('id').notNull().defaultRandom(),
    reference: varchar('reference', { length: 128 }), // paystack , stripe
    accessCode: varchar('access_code', { length: 128 }),
    paymentGateway: varchar('payment_gateway', { length: 128 }).notNull().default('stripe'),
    amount: doublePrecision('amount').default(0.0).notNull(),
    status: varchar('status', { length: 64 }).notNull().default('pending'),
    email: varchar('email', { length: 128 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid('user_id').references(() => Users.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const salesRelation = relations(Sales, ({ one, many }) => ({
    user: one(Users, {
        fields: [Sales.userId],
        references: [Users.id]
    }),
    saleItems: many(SaleItems),
}))

export const SaleItems = pgTable('sale_items', {
    id: uuid('id').notNull().defaultRandom(),
    months: integer('months').notNull().default(0),
    price: doublePrecision('price').default(0.0),
    examID: uuid('exam_id').notNull().references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    saleID: uuid('sale_id').notNull().references(() => Sales.id, { onDelete: 'cascade', onUpdate: 'cascade' })
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const saleItemsRelations = relations(SaleItems, ({ one, many }) => ({
    exam: one(Exams, {
        fields: [SaleItems.examID],
        references: [Exams.id]
    }),
    sale: one(Sales, {
        fields: [SaleItems.saleID],
        references: [Sales.id]
    }),
}));

// export type SaleItem = (InferSelectModel<typeof SaleItems> & {
//     exam?: typeof Exams,
// }) | undefined