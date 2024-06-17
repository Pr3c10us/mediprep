import {boolean, integer, pgTable, primaryKey, text, timestamp, uuid, varchar} from 'drizzle-orm/pg-core';
import {InferSelectModel, relations} from "drizzle-orm";
import {Admins} from "./admins";

export const ExamAccess = pgTable('exam_access', {
    adminId: uuid('admin_id').notNull().references(() => Admins.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    examId: uuid('exam_id').notNull().references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
}, (t) => ({
    pk: primaryKey({columns: [t.adminId, t.examId]}),
}),)

export const adminsToExamRelations = relations(ExamAccess, ({one}) => ({
    exam: one(Exams, {
        fields: [ExamAccess.examId],
        references: [Exams.id],
    }),
    admin: one(Admins, {
        fields: [ExamAccess.adminId],
        references: [Admins.id],
    }),
}));

export const Exams = pgTable('exam', {
    id: uuid('id').defaultRandom(),
    name: varchar('name', {length: 32}).unique(),
    description: text('description').notNull(),
    imageURL: varchar('image_url', {length: 255}),
    subscriptionAmount: integer('subscription_amount').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}),)

export const examRelations = relations(Exams, ({many}) => ({
    examsAccess: many(ExamAccess),
    courses: many(Courses)
}));

export const Courses = pgTable('courses', {
    id: uuid('id').defaultRandom(),
    name: varchar('name', {length: 128}).unique().notNull(),
    examId: uuid('exam_id').references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const courseExamRelation = relations(Courses, ({one}) => ({
    exam: one(Exams, {
        fields: [Courses.examId],
        references: [Exams.id]
    })
}))

export const courseSubjectRelation = relations(Courses, ({many}) => ({
    subjects: many(Subjects)
}))


export const Subjects = pgTable('subject', {
    id: uuid('id').defaultRandom(),
    name: varchar('name', {length: 128}).unique().notNull(),
    courseId: uuid('course_id').references(() => Courses.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const subjectCourseRelation = relations(Subjects, ({one}) => ({
    course: one(Courses, {
        fields: [Subjects.courseId],
        references: [Courses.id]
    })
}))

export const subjectQuestionRelation = relations(Subjects, ({many}) => ({
    questions: many(Questions)
}))

export const Questions = pgTable('question', {
    id: uuid('id').defaultRandom(),
    description: text('description').notNull(),
    question: text('question').notNull(),
    questionImageUrl: varchar('question_image_url', {length: 128}),
    explanationImageUrl: varchar('explanation_image_url', {length: 128}),
    explanation: text('explanation').notNull(),
    free: boolean('free').default(false),
    subjectId: uuid('subject_id').references(() => Subjects.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const questionSubjectRelation = relations(Questions, ({one}) => ({
    subject: one(Subjects, {
        fields: [Questions.subjectId],
        references: [Subjects.id]
    })
}))
export const questionRelation = relations(Questions, ({many}) => ({
    options: many(Options)
}))

export type Question = (InferSelectModel<typeof Questions> & {
    options?: typeof Options[],
    subject?: typeof Subjects
}) | undefined

export const Options = pgTable('option', {
    id: uuid('id').defaultRandom(),
    index: integer('index').notNull(),
    value: text('value').notNull().unique(),
    selected: integer('selected').default(0),
    answer: boolean('answer').default(false),
    explanation: text('explanation'),
    questionId: uuid('question_id').references(() => Questions.id, {onDelete: 'cascade', onUpdate: 'cascade'})
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const optionRelation = relations(Options, ({one}) => ({
    question: one(Questions, {
        fields: [Options.questionId],
        references: [Questions.id],
    })
}))


