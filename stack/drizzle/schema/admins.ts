import {
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    primaryKey
} from 'drizzle-orm/pg-core';
import {relations, sql} from "drizzle-orm";
import {ExamAccess} from "./exams";

export const Admins = pgTable('admin',{
    id: uuid('id').defaultRandom(),
    name: varchar('name',{length: 32}),
    email: varchar('email',{length: 256}).unique(),
    password: varchar('password',{length: 256}),
    roles: varchar('roles',{length:32})
        .array()
        .notNull()
        .default(sql`ARRAY['viewer']::varchar(32)[]`),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
},(t) => ({
    pk: primaryKey({ columns: [t.id] }),
}),)

export const adminRelations = relations(Admins, ({ many }) => ({
    examsAccess: many(ExamAccess),
}));


