import {boolean, pgTable, primaryKey, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const Users = pgTable("user", {
    id: uuid('id').defaultRandom(),
    firstName: varchar('first_name', {length: 64}).notNull(),
    lastName: varchar('last_name', {length: 64}).notNull(),
    email: varchar('email', {length: 64}).notNull().unique(),
    password: varchar('password', {length: 256}).notNull(),
    profession: varchar('profession', {length: 64}).notNull(),
    country: varchar('country', {length: 64}).notNull(),
    verified: boolean('verified').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({columns: [t.id]})
}))