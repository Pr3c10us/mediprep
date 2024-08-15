import {doublePrecision, integer, pgTable, primaryKey, text, timestamp, uuid, varchar} from 'drizzle-orm/pg-core';
import {relations, sql} from "drizzle-orm";
import {Users} from "./users";
import {Courses, Exams, Options, Questions, Subjects} from "./exams";

export const Tests = pgTable("tests", {
    id: uuid('id').defaultRandom(),
    status: varchar("status", {length: 32}).notNull().default("inProgress"),
    score: doublePrecision("score").notNull().default(0),
    questions: integer("questions").default(0),
    correctAnswers: integer("correct_answers").default(0),
    incorrectAnswers: integer("incorrect_answers").default(0),
    unansweredQuestions: integer("unanswered_questions").default(0),
    type: varchar("type", {length: 32}).default('mock'),
    questionMode: varchar("question_mode", {length: 32}).default("unused"),
    userId: uuid('user_id').references(() => Users.id).notNull(),
    subjectId: uuid('subject_id').references(() => Subjects.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    courseId: uuid('course_id').references(() => Courses.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    examId: uuid('exam_id').references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
    endTime: timestamp('end_Time').default(new Date(new Date().getTime() + 60 * 60 * 1000)),
    timeLeft: integer('time_left').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const testsRelation = relations(Tests, ({one, many}) => ({
    user: one(Users, {
        fields: [Tests.userId],
        references: [Users.id]
    }),
    subject: one(Subjects, {
        fields: [Tests.subjectId],
        references: [Subjects.id]
    }),
    course: one(Courses, {
        fields: [Tests.courseId],
        references: [Courses.id]
    }),
    exam: one(Exams, {
        fields: [Tests.examId],
        references: [Exams.id]
    }),
    questions: many(TestQuestionRecords)
}))

export const TestQuestionRecords = pgTable("test_question_records", {
    id: uuid('id').defaultRandom(),
    questionStatus: varchar("question_status", {length: 32}).notNull().default('unanswered'),
    questionType: varchar('type', {length: 32}).notNull(),
    testId: uuid('test_id').references(() => Tests.id).notNull(),
    userId: uuid('user_id').references(() => Users.id).notNull(),
    optionId: uuid('option_id').references(() => Options.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    options: text("options").array().default(sql`'{}'::text[]`),
    answer: text("answer"),
    questionId: uuid('question_id').references(() => Questions.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
    }).notNull(),
    subjectId: uuid('subject_id').references(() => Subjects.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    courseId: uuid('course_id').references(() => Courses.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    examId: uuid('exam_id').references(() => Exams.id, {onDelete: 'cascade', onUpdate: 'cascade'}).notNull(),
}, (t) => ({
    pk: primaryKey({columns: [t.id]}),
}))

export const userQuestionRecordsRelation = relations(TestQuestionRecords, ({one}) => ({
    test: one(Tests, {
        fields: [TestQuestionRecords.testId],
        references: [Tests.id]
    }),
    user: one(Users, {
        fields: [TestQuestionRecords.userId],
        references: [Users.id]
    }),
    option: one(Options, {
        fields: [TestQuestionRecords.optionId],
        references: [Options.id],
    }),
    question: one(Questions, {
        fields: [TestQuestionRecords.questionId],
        references: [Questions.id],
    }),
    subject: one(Subjects, {
        fields: [TestQuestionRecords.subjectId],
        references: [Subjects.id]
    }),
    course: one(Courses, {
        fields: [TestQuestionRecords.courseId],
        references: [Courses.id]
    }),
    exam: one(Exams, {
        fields: [TestQuestionRecords.examId],
        references: [Exams.id]
    }),
}))

