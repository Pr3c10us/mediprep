import { ExamRepository } from "../../../../../domain/exams/repository";
import { drizzle } from "drizzle-orm/node-postgres";
import {
    Course,
    EditExamParams,
    EditQuestionParams,
    Exam,
    ExamDiscount,
    Option,
    Question,
    QuestionBatch as QB,
    QuestionBatchStatus,
    QuestionType,
    QuestionWithReason,
    Subject
} from "../../../../../domain/exams/exam";
import * as schema from "../../../../../../../stack/drizzle/schema/exams"
import {
    Courses,
    ExamDiscounts,
    Exams,
    Options,
    Question as QuestionT,
    QuestionBatch,
    Questions,
    Subject as SubjectT,
    Subjects,
    UserReportQuestionRecords,
    UserTagQuestionRecords
} from "../../../../../../../stack/drizzle/schema/exams"
import { PaginationFilter, PaginationMetaData } from "../../../../../../pkg/types/pagination";
import { and, count, eq, ilike, sql } from "drizzle-orm";
import { BadRequestError } from "../../../../../../pkg/errors/customError";
import { PoolClient } from "pg";
import { UserExamAccess } from "../../../../../../../stack/drizzle/schema/users";
import { SaleItems } from "../../../../../../../stack/drizzle/schema/sales";

export class ExamRepositoryDrizzle implements ExamRepository {
    db

    constructor(pool: PoolClient) {
        this.db = drizzle(pool, { schema })
    }

    // Add
    async AddExam(examParam: Exam): Promise<void> {
        try {
            const exam = await this.db.insert(Exams).values({
                name: examParam.name,
                totalMockScores: examParam.totalMockScores,
                mocksTaken: examParam.mocksTaken,
                mockTestTime: examParam.mockTestTime,
                description: examParam.description,
                subscriptionAmount: String(examParam.subscriptionAmount),
                mockQuestions: examParam.mockQuestions
            }).returning()

            await this.db.insert(ExamDiscounts).values([{
                month: 1,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 2,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 3,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 4,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 5,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 6,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }, {
                month: 12,
                type: 'percent',
                value: String(0),
                examId: exam[0].id,
            }])
        } catch (error) {
            throw error
        }
    }

    async AddExamDiscount(discount: ExamDiscount): Promise<void> {
        try {
            const examDiscount = await this.db.select().from(ExamDiscounts).where(and(eq(ExamDiscounts.month, discount.month), eq(ExamDiscounts.examId, discount.examID)))
            console.log(examDiscount)
            if (examDiscount.length > 0) {
                await this.db.update(ExamDiscounts).set({
                    month: discount.month,
                    type: discount.type,
                    value: String(discount.value),
                    examId: discount.examID,
                }).where(eq(ExamDiscounts.id, examDiscount[0].id as string))
            } else {
                await this.db.insert(ExamDiscounts).values({
                    month: discount.month,
                    type: discount.type,
                    value: String(discount.value),
                    examId: discount.examID,
                })
            }

        } catch (error) {
            throw error
        }
    }

    async AddCourse(courseParams: Course): Promise<Course> {
        try {
            const course = await this.db.insert(Courses).values({
                name: courseParams.name,
                examId: courseParams.examId
            }).returning()

            return {
                id: course[0].id as string,
                name: course[0].name,
                examId: course[0].examId as string
            }
        } catch (error) {
            throw error
        }
    }

    async AddSubject(subjectParams: Subject): Promise<Subject> {
        try {
            const course = await this.db.select().from(Courses).where(eq(Courses.id, subjectParams.courseId as string))
            if (!course[0]) {
                throw new BadRequestError(`course with id ${subjectParams.courseId} does not exist`)
            }
            const subject = await this.db.insert(Subjects).values({
                name: subjectParams.name,
                courseId: course[0].id,
                examId: course[0].examId
            }).returning()

            return {
                id: subject[0].id as string, name: subject[0].name, courseId: subject[0].courseId as string
            }


        } catch (error) {
            throw error
        }
    }

    async AddQuestion(questionParams: Question): Promise<void> {
        try {
            await this.db.transaction(async (tx) => {
                try {
                    const subject: SubjectT = await this.db.query.Subjects.findFirst({
                        where: eq(Subjects.id, questionParams.subjectId as string),
                        with: {
                            course: {
                                with: {
                                    exam: true
                                }
                            }
                        }
                    })
                    if (!subject) {
                        throw new BadRequestError(`subject with id ${questionParams.subjectId} does not exist`)
                    }
                    const newQuestionResults = await tx.insert(Questions).values({
                        type: questionParams.type,
                        question: questionParams.question,
                        explanation: questionParams.explanation,
                        subjectId: questionParams.subjectId,
                        courseId: subject.course?.id as string,
                        examId: subject.course?.exam?.id as unknown as string,
                        questionBatchId: questionParams.questionBatchId
                    }).returning()
                    const newQuestion = newQuestionResults[0]
                    let index = 0
                    if (questionParams.options != undefined && questionParams.options.length > 0) {
                        for await (let optionParams of questionParams.options) {
                            await tx.insert(Options).values({
                                index: index,
                                value: optionParams.value,
                                answer: optionParams.answer,
                                questionId: newQuestion.id
                            })
                            index++
                        }
                    }
                    return
                } catch (error) {
                    try {
                        tx.rollback()
                    } catch (e) {
                        throw error
                    }
                }
            })
        } catch (error) {
            throw error
        }
    }

    async AddQuestionBatch(examId: string): Promise<QB> {
        try {
            const qb = await this.db.insert(QuestionBatch).values({
                examId: examId,
            }).returning()

            const questionBatch = qb[0]
            return {
                id: questionBatch.id as string,
                status: questionBatch.status as QuestionBatchStatus,
                examId: questionBatch.examId as string,
                createdAt: questionBatch.createdAt as Date,
                updatedAt: questionBatch.updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }


    // Delete
    async DeleteExam(id: string): Promise<void> {
        try {
            await this.db.delete(Exams).where(eq(Exams.id, id))
        } catch (error) {
            throw error
        }
    }

    async DeleteCourse(id: string): Promise<void> {
        try {
            await this.db.delete(Courses).where(eq(Courses.id, id))
        } catch (error) {
            throw error
        }
    }

    async DeleteSubject(id: string): Promise<void> {
        try {
            await this.db.delete(Subjects).where(eq(Subjects.id, id))
        } catch (error) {
            throw error
        }
    }

    async DeleteQuestion(id: string): Promise<void> {
        try {
            await this.db.delete(Questions).where(eq(Questions.id, id))
        } catch (error) {
            throw error
        }
    }


    // Edit
    async EditExam(id: string, examParams: EditExamParams): Promise<void> {
        try {
            console.log(examParams)
            let setParams: any
            if (examParams.subscriptionAmount != undefined) {
                setParams = {
                    ...examParams,
                    subscriptionAmount: String(examParams.subscriptionAmount)
                }
            } else {
                setParams = {
                    ...examParams
                }
            }
            const updatedExam = await this.db.update(Exams).set(setParams).where(eq(Exams.id, id)).returning({ id: Exams.id })
            if (updatedExam.length < 1) {
                throw new BadRequestError(`exam with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    async EditCourseName(id: string, name: string): Promise<void> {
        try {
            const updatedCourse = await this.db.update(Courses).set({ name: name }).where(eq(Courses.id, id)).returning({ id: Courses.id })
            if (updatedCourse.length < 1) {
                throw new BadRequestError(`course with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    async EditSubjectName(id: string, name: string): Promise<void> {
        try {
            const updatedSubject = await this.db.update(Subjects).set({ name: name }).where(eq(Subjects.id, id)).returning({ id: Subjects.id })
            if (updatedSubject.length < 1) {
                throw new BadRequestError(`subject with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    async EditQuestion(questionParams: EditQuestionParams): Promise<void> {
        try {
            await this.db.transaction(async (tx) => {
                try {
                    const updatedQuestion = await tx.update(Questions).set(questionParams).where(eq(Questions.id, questionParams.id as string)).returning({ id: Questions.id })
                    if (updatedQuestion.length < 1) throw new BadRequestError(`question with id '${questionParams.id}' does not exist`)
                    if (questionParams.options != undefined && questionParams.options.length > 0) {
                        for await (let option of questionParams.options) {
                            await tx.update(Options).set(option).where(and(eq(Options.index, option.index), eq(Options.questionId, questionParams.id as string)))
                        }
                    }
                    return
                } catch (error) {
                    try {
                        tx.rollback()
                    } catch (e) {
                        throw error
                    }
                }
            })
        } catch (error) {
            throw error
        }
    }

    async UpdateQuestionBatchStatus(id: string, status: QuestionBatchStatus): Promise<void> {
        try {
            const updatedQuestionBatch = await this.db.update(QuestionBatch).set({ status: status }).where(eq(QuestionBatch.id, id)).returning({ id: QuestionBatch.id })
            if (updatedQuestionBatch.length < 1) {
                throw new BadRequestError(`question batch with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }


    // Get Many
    async GetExams(filter: PaginationFilter): Promise<{ exams: Exam[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(Exams).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    exams: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const query = this.db.select().from(Exams);

            if (filters.length > 0) {
                query.where(and(...filters));
            }
            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (rows.length > 0) {
                return {
                    exams: rows.map((row) => {
                        return {
                            id: row.id as string,
                            name: row.name as string,
                            description: row.description as string,
                            subscriptionAmount: Number(row.subscriptionAmount),
                            totalMockScores: row.totalMockScores,
                            mocksTaken: row.mocksTaken,
                            mockTestTime: row.mockTestTime,
                            imageURL: row.imageURL as string,
                            createdAt: row.createdAt as Date,
                            updatedAt: row.updatedAt as Date
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            return {
                exams: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error
        }
    }

    async GetExamDiscounts(examID: string): Promise<ExamDiscount[]> {
        try {
            const rows = await this.db.select().from(ExamDiscounts).where(eq(ExamDiscounts.examId, examID))
            if (rows.length > 0) {
                return rows.map((row): ExamDiscount => {
                    return {
                        id: row.id as string,
                        month: row.month,
                        type: row.type as 'percent' | 'flat',
                        value: Number(row.value),
                        examID: row.examId as string,
                    }
                })
            }
            return []
        } catch (error) {
            throw error
        }
    }

    async GetCourses(filter: PaginationFilter):
        Promise<{ courses: Course[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Courses.name, `%${filter.name}%`));
            }

            if (filter.examId || filter.examId != undefined) {
                filters.push(eq(Courses.examId, filter.examId));
            }
            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(Courses).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    courses: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            const query = this.db.select().from(Courses);
            if (filters.length > 0) {
                query.where(and(...filters));
            }
            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (rows.length > 0) {
                return {
                    courses: rows.map((row) => {
                        return {
                            id: row.id as string,
                            name: row.name as string,
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            return {
                courses: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch
        (error) {
            throw error
        }
    }

    async GetSubjects(filter: PaginationFilter):
        Promise<{ subjects: Subject[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Subjects.name, `%${filter.name}%`));
            }

            if (filter.courseId || filter.courseId != undefined) {
                filters.push(eq(Subjects.courseId, filter.courseId));
            }

            if (filter.examId || filter.examId != undefined) {
                filters.push(eq(Subjects.examId, filter.examId));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(Subjects).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    subjects: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const query = this.db.select().from(Subjects);

            if (filters.length > 0) {
                query.where(and(...filters));
            }
            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (rows.length > 0) {
                return {
                    subjects: rows.map((row) => {
                        return {
                            id: row.id as string,
                            name: row.name as string,
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            return {
                subjects: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch
        (error) {
            throw error
        }
    }

    async GetQuestions(filter: PaginationFilter): Promise<{ questions: Question[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];

            if (filter.subjectId || filter.subjectId != undefined) {
                filters.push(eq(Questions.subjectId, filter.subjectId as string));

            }
            if (filter.courseId || filter.courseId != undefined) {
                filters.push(eq(Questions.courseId, filter.courseId as string));

            }
            if (filter.examId || filter.examId != undefined) {
                filters.push(eq(Questions.examId, filter.examId as string));

            }

            if (filter.free || filter.free != undefined) {
                filters.push(eq(Questions.free, filter.free as boolean));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(Questions).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    questions: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const questions = await this.db.query.Questions.findMany({
                where: and(...filters),
                with: {
                    options: true
                },
                orderBy: filter.random ? sql`RANDOM
                ()` : undefined,
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            })
            if (questions.length > 0) {
                return {
                    questions: questions.map((question: any): Question => {
                        return {
                            id: question.id as string,
                            type: question.type as QuestionType,
                            explanation: question.explanation as string,
                            question: question.question as string,
                            options: question.options?.map((option: any): Option => {
                                return {
                                    index: option.index,
                                    value: option.value,
                                    selected: option.selected,
                                    answer: option.answer,
                                }
                            })
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }


            return {
                questions: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch
        (error) {
            throw error
        }
    }

    async GetQuestionBatches(filter: PaginationFilter): Promise<{
        questionBatches: QB[],
        metadata: PaginationMetaData
    }> {
        try {
            const filters: string | any[] = [];
            if (filter.status || filter.status != undefined) {
                filters.push(ilike(QuestionBatch.status, `%${filter.status}%`));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(QuestionBatch).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    questionBatches: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const query = this.db.select().from(QuestionBatch);

            if (filters.length > 0) {
                query.where(and(...filters));
            }
            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (rows.length > 0) {
                return {
                    questionBatches: rows.map((row): QB => {
                        return {
                            id: row.id as string,
                            examId: row.examId as string,
                            status: row.status as QuestionBatchStatus,
                            createdAt: row.createdAt as Date,
                            updatedAt: row.updatedAt as Date
                        }
                    }),
                    metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            return {
                questionBatches: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error
        }
    }

    // Get One
    async GetExamById(id: string): Promise<Exam> {
        try {
            const examResult = await this.db.select().from(Exams).where(eq(Exams.id, id))
            if (examResult.length < 1) {
                throw new BadRequestError(`exam with id '${id}' does not exist`)
            }
            return {
                id: examResult[0].id as string,
                name: examResult[0].name as string,
                description: examResult[0].description as string,
                totalMockScores: examResult[0].totalMockScores,
                mocksTaken: examResult[0].mocksTaken,
                mockTestTime: examResult[0].mockTestTime,
                subscriptionAmount: Number(examResult[0].subscriptionAmount),
                imageURL: examResult[0].imageURL as string,
                createdAt: examResult[0].createdAt as Date,
                updatedAt: examResult[0].updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    async GetExamAnalytics(id: string): Promise<Exam> {
        try {
            const examResult = await this.db.select().from(Exams).where(eq(Exams.id, id))
            if (examResult.length < 1) {
                throw new BadRequestError(`exam with id '${id}' does not exist`)
            }
            let exam = examResult[0]
            const subjects = await this.db.select().from(Subjects).where(eq(Subjects.examId, id))
            const courses = await this.db.select().from(Courses).where(eq(Courses.examId, id))
            const users = await this.db.select().from(UserExamAccess).where(eq(UserExamAccess.examId, id))
            const sales = await this.db.select().from(SaleItems).where(eq(SaleItems.examID, id))
            return {
                id: exam.id as string,
                name: exam.name as string,
                description: exam.description as string,
                subscriptionAmount: Number(exam.subscriptionAmount),
                totalMockScores: exam.totalMockScores,
                mocksTaken: exam.mocksTaken,
                mockTestTime: exam.mockTestTime,
                imageURL: exam.imageURL as string,
                createdAt: exam.createdAt as Date,
                updatedAt: exam.updatedAt as Date,
                subjectsNo: subjects.length,
                coursesNo: courses.length,
                usersNo: users.length,
                salesNo: sales.length
            }
        } catch (error) {
            throw error
        }
    }

    async GetCourseById(courseId: string): Promise<Course> {
        try {
            const courseResult = await this.db.select().from(Courses).where(eq(Courses.id, courseId))
            if (courseResult.length < 1) {
                throw new BadRequestError(`course does not exist`)
            }
            return {
                id: courseResult[0].id as string,
                name: courseResult[0].name as string,
            }
        } catch (error) {
            throw error
        }
    }

    async GetSubjectById(subjectId: string): Promise<Subject> {
        try {
            const subjectResult = await this.db.select().from(Subjects).where(eq(Subjects.id, subjectId))
            if (subjectResult.length < 1) {
                throw new BadRequestError(`subject does not exist`)
            }
            return {
                id: subjectResult[0].id as string,
                name: subjectResult[0].name as string,
            }
        } catch (error) {
            throw error
        }
    }

    async GetQuestionById(questionId: string): Promise<Question> {
        try {
            const questionResult: QuestionT = await this.db.query.Questions.findFirst({
                where: eq(Questions.id, questionId),
                with: {
                    options: true
                }
            })
            if (!questionResult) {
                throw new BadRequestError("question does not exist")
            }
            return {
                id: questionResult.id as string,
                type: questionResult.type as QuestionType,
                explanation: questionResult.explanation as string,
                question: questionResult.question as string,
                options: questionResult.options?.map((option: any): Option => {
                    return {
                        index: option.index,
                        value: option.value,
                        selected: option.selected,
                        answer: option.answer,
                    }
                })
            }

        } catch (error) {
            throw error
        }
    }

    async GetQuestionBatchByID(id: string): Promise<QB> {
        try {
            const questionBatchResult = await this.db.select().from(QuestionBatch).where(eq(QuestionBatch.id, id))
            if (questionBatchResult.length < 1) {
                throw new BadRequestError(`question batch with id '${id}' does not exist`)
            }
            return {
                id: questionBatchResult[0].id as string,
                status: questionBatchResult[0].status as QuestionBatchStatus,
                examId: questionBatchResult[0].examId as string,
                createdAt: questionBatchResult[0].createdAt as Date,
                updatedAt: questionBatchResult[0].updatedAt as Date
            }
        } catch (error) {
            throw error
        }
    }

    async TagQuestion(userId: string, questionId: string): Promise<void> {
        try {
            const question = await this.db.select().from(Questions).where(eq(Questions.id, questionId));
            if (question.length < 1) {
                throw new BadRequestError("question does not exist")
            }
            await this.db.insert(UserTagQuestionRecords).values({
                userId,
                questionId,
                examId: question[0].examId
            })
        } catch (error) {
            throw error
        }
    }

    async GetTaggedQuestions(filter: PaginationFilter): Promise<{
        questions: QuestionWithReason[],
        metadata: PaginationMetaData
    }> {
        try {
            const totalResult = await this.db.select({ count: count() }).from(UserTagQuestionRecords).where(and(eq(UserTagQuestionRecords.userId, filter.userId as string), eq(UserTagQuestionRecords.examId, filter.examId as string)));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    questions: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const taggedQuestions = await this.db.query.UserTagQuestionRecords.findMany({
                where: and(eq(UserTagQuestionRecords.userId, filter.userId as string), eq(UserTagQuestionRecords.examId, filter.examId as string)),
                with: {
                    question: {
                        with: {
                            subject: true,
                            course: true
                        }
                    }
                },
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            })
            // const questions = taggedQuestions.map((tq) => tq.question)

            if (taggedQuestions.length > 0) {
                return {
                    questions: taggedQuestions.map((question: any): QuestionWithReason => {
                        return {
                            id: question.questionId as string,
                            type: question.type as QuestionType,
                            courseName: question.question.course.name,
                            subjectName: question.question.subject.name,
                            createdAt: question.createdAt,
                            reason: "",
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }


            return {
                questions: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error
        }
    }

    async ReportQuestion(userId: string, questionId: string, reason: string): Promise<void> {
        try {
            const question = await this.db.select().from(Questions).where(eq(Questions.id, questionId));
            if (question.length < 1) {
                throw new BadRequestError("question does not exist")
            }
            await this.db.insert(UserReportQuestionRecords).values({
                userId,
                questionId,
                reason,
                examId: question[0].examId
            })
        } catch (error) {
            throw error
        }
    }

    async GetReportedQuestions(filter: PaginationFilter): Promise<{
        questions: QuestionWithReason[],
        metadata: PaginationMetaData
    }> {
        try {
            const totalResult = await this.db.select({ count: count() }).from(UserReportQuestionRecords).where(eq(UserReportQuestionRecords.examId, filter.examId as string));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    questions: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const reportedQuestions = await this.db.query.UserReportQuestionRecords.findMany({
                where: eq(UserReportQuestionRecords.examId, filter.examId as string),
                with: {
                    question: {
                        with: {
                            subject: true,
                            course: true
                        }
                    }
                },
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            })

            if (reportedQuestions.length > 0) {
                return {
                    questions: reportedQuestions.map((question: any): QuestionWithReason => {
                        return {
                            id: question.question.id as string,
                            type: question.question.type as QuestionType,
                            reason: question.reason,
                            courseName: question.question.course.name,
                            subjectName: question.question.subject.name,
                            createdAt: question.createdAt as Date
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }


            return {
                questions: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            };
        } catch (error) {
            throw error
        }
    }


}

