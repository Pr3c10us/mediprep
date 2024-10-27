import {
    boolean,
    integer,
    decimal,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    varchar,
    doublePrecision
} from 'drizzle-orm/pg-core';
import { InferSelectModel, relations } from "drizzle-orm";
import { Admins } from "./admins";
import { UserExamAccess, Users } from "./users";
import { Sales } from "./sales";

export const ExamAccess = pgTable('exam_access', {
    adminId: uuid('admin_id').notNull().references(() => Admins.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    examId: uuid('exam_id').notNull().references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.adminId, t.examId] }),
}),)

export const adminsToExamRelations = relations(ExamAccess, ({ one }) => ({
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
    name: varchar('name', { length: 32 }).unique(),
    totalMockScores: doublePrecision("total_mock_score").notNull().default(0.0),
    mocksTaken: integer('mock_taken').notNull().default(0),
    mockTestTime: integer('mock_test_time').notNull().default(60),
    description: text('description').notNull(),
    imageURL: varchar('image_url', { length: 255 }),
    subscriptionAmount: decimal('subscription_amount').default('0.0'),
    mockQuestions: integer("mock_questions").notNull().default(100),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const examRelations = relations(Exams, ({ many }) => ({
    examsAccess: many(ExamAccess),
    userExamAccess: many(UserExamAccess),
    courses: many(Courses),
    discounts: many(ExamDiscounts),
    sales: many(Sales),
    questions: many(Questions),
    questionBatches: many(QuestionBatch)
}));

export const ExamDiscounts = pgTable('discounts', {
    id: uuid('id').defaultRandom(),
    month: integer('month').notNull(),
    type: varchar('type', { length: 32 }).default('percent'),
    value: decimal('value').default('0.0'),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' })
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const discountExamRelation = relations(ExamDiscounts, ({ one }) => ({
    exam: one(Exams, {
        fields: [ExamDiscounts.examId],
        references: [Exams.id]
    })
}))

export const Courses = pgTable('courses', {
    id: uuid('id').defaultRandom(),
    name: varchar('name', { length: 128 }).notNull(),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' })
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export type Course = (InferSelectModel<typeof Courses> & {
    exam?: typeof Exams,
}) | undefined

export const courseExamRelation = relations(Courses, ({ one }) => ({
    exam: one(Exams, {
        fields: [Courses.examId],
        references: [Exams.id]
    })
}))

export const courseSubjectRelation = relations(Courses, ({ many }) => ({
    subjects: many(Subjects)
}))


export const Subjects = pgTable('subject', {
    id: uuid('id').defaultRandom(),
    name: varchar('name', { length: 128 }).notNull(),
    courseId: uuid('course_id').references(() => Courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const subjectCourseRelation = relations(Subjects, ({ one }) => ({
    course: one(Courses, {
        fields: [Subjects.courseId],
        references: [Courses.id]
    })
}))

export const subjectQuestionRelation = relations(Subjects, ({ many }) => ({
    questions: many(Questions)
}))


export type Subject = (InferSelectModel<typeof Subjects> & {
    course?: Course,
}) | undefined

export const Questions = pgTable('question', {
    id: uuid('id').defaultRandom(),
    type: varchar('type', { length: 32 }).notNull(),
    question: text('question').notNull(),
    explanation: text('explanation'),
    free: boolean('free').default(false),
    subjectId: uuid('subject_id').references(() => Subjects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    courseId: uuid('course_id').references(() => Courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    questionBatchId: uuid('question_batch_id').references(() => QuestionBatch.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    })
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const questionSubjectRelation = relations(Questions, ({ one }) => ({
    subject: one(Subjects, {
        fields: [Questions.subjectId],
        references: [Subjects.id]
    }),
    course: one(Courses, {
        fields: [Questions.courseId],
        references: [Courses.id]
    }),
    exam: one(Exams, {
        fields: [Questions.examId],
        references: [Exams.id]
    }),
    questionBatch: one(QuestionBatch, {
        fields: [Questions.questionBatchId],
        references: [QuestionBatch.id]
    })
}))
export const questionRelation = relations(Questions, ({ many }) => ({
    options: many(Options)
}))

export type Question = (InferSelectModel<typeof Questions> & {
    options?: typeof Options[],
    subject?: typeof Subjects
}) | undefined

export const Options = pgTable('option', {
    id: uuid('id').defaultRandom(),
    index: integer('index').notNull(),
    value: text('value').notNull(),
    selected: integer('selected').default(0),
    answer: boolean('answer').default(false),
    questionId: uuid('question_id').references(() => Questions.id, { onDelete: 'cascade', onUpdate: 'cascade' })
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const optionRelation = relations(Options, ({ one }) => ({
    question: one(Questions, {
        fields: [Options.questionId],
        references: [Questions.id],
    })
}))

export const QuestionBatch = pgTable('question_batch', {
    id: uuid('id').defaultRandom(),
    status: varchar('status', { length: 128 }).default('processing'),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const questionBatchRelation = relations(QuestionBatch, ({ one, many }) => ({
    questions: many(Questions),
    exam: one(Exams, {
        fields: [QuestionBatch.examId],
        references: [Exams.id]
    })
}))

export const UserQuestionRecords = pgTable("user_question_records", {
    id: uuid('id').defaultRandom(),
    userId: uuid('user_id').references(() => Users.id).notNull(),
    questionId: uuid('question_id').references(() => Questions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    subjectId: uuid('subject_id').references(() => Subjects.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    courseId: uuid('course_id').references(() => Courses.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const userQuestionRecordsRelation = relations(UserQuestionRecords, ({ one }) => ({
    user: one(Users, {
        fields: [UserQuestionRecords.userId],
        references: [Users.id]
    }),
    question: one(Questions, {
        fields: [UserQuestionRecords.questionId],
        references: [Questions.id],
    }),
    subject: one(Subjects, {
        fields: [UserQuestionRecords.subjectId],
        references: [Subjects.id]
    }),
    course: one(Courses, {
        fields: [UserQuestionRecords.courseId],
        references: [Courses.id]
    }),
    exam: one(Exams, {
        fields: [UserQuestionRecords.examId],
        references: [Exams.id]
    }),
}))

export const UserTagQuestionRecords = pgTable("user_tag_question_records", {
    id: uuid('id').defaultRandom(),
    userId: uuid('user_id').references(() => Users.id).notNull(),
    questionId: uuid('question_id').references(() => Questions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const userTagQuestionRecordsRelation = relations(UserTagQuestionRecords, ({ one }) => ({
    user: one(Users, {
        fields: [UserTagQuestionRecords.userId],
        references: [Users.id]
    }),
    question: one(Questions, {
        fields: [UserTagQuestionRecords.questionId],
        references: [Questions.id],
    }),
    exam: one(Exams, {
        fields: [UserTagQuestionRecords.examId],
        references: [Exams.id]
    }),
}))

export const UserReportQuestionRecords = pgTable("user_report_question_records", {
    id: uuid('id').defaultRandom(),
    userId: uuid('user_id').references(() => Users.id).notNull(),
    questionId: uuid('question_id').references(() => Questions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    examId: uuid('exam_id').references(() => Exams.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    reason: text("reason").notNull()
}, (t) => ({
    pk: primaryKey({ columns: [t.id] }),
}))

export const userReportQuestionRecordsRelation = relations(UserReportQuestionRecords, ({ one }) => ({
    user: one(Users, {
        fields: [UserReportQuestionRecords.userId],
        references: [Users.id]
    }),
    question: one(Questions, {
        fields: [UserReportQuestionRecords.questionId],
        references: [Questions.id],
    }),
    exam: one(Exams, {
        fields: [UserReportQuestionRecords.examId],
        references: [Exams.id]
    }),
}))