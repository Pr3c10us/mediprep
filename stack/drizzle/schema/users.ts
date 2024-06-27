import {boolean, pgTable, primaryKey, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {ExamAccess, Exams} from "./exams";
import {relations} from "drizzle-orm";
import {Admins} from "./admins";
import {Sales} from "./sales";

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

export const UserExamAccess = pgTable('user_exam_access', {
    userId: uuid('user_id').notNull().references(() => Users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    examId: uuid('exam_id').notNull().references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    expiryDate: timestamp("expires").notNull()
}, (t) => ({
    pk: primaryKey({columns: [t.userId, t.examId]}),
}))

export const userToExamRelations = relations(UserExamAccess, ({one}) => ({
    exam: one(Exams, {
        fields: [UserExamAccess.examId],
        references: [Exams.id],
    }),
    user: one(Admins, {
        fields: [UserExamAccess.userId],
        references: [Admins.id],
    }),
}));


export const userExamRelations = relations(Users, ({many}) => ({
    userExamAccess: many(UserExamAccess),
    sales : many(Sales)
}));