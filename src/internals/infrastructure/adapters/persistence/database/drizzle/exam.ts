import {ExamRepository} from "../../../../../domain/exams/repository";
import {drizzle} from "drizzle-orm/node-postgres";
import {
    Course,
    EditExamParams,
    EditQuestionParams,
    Exam,
    Option,
    Question,
    Subject
} from "../../../../../domain/exams/exam";
import * as schema from "../../../../../../../stack/drizzle/schema/exams"
import {
    Courses,
    Exams,
    Options,
    Question as QuestionT,
    Questions,
    Subjects
} from "../../../../../../../stack/drizzle/schema/exams"
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {and, count, eq, ilike} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";
import {PoolClient} from "pg";

export class ExamRepositoryDrizzle implements ExamRepository {
    db

    constructor(pool: PoolClient) {
        this.db = drizzle(pool, {schema})
    }

    // Add
    async AddExam(examParam: Exam): Promise<void> {
        try {
            await this.db.insert(Exams).values({
                name: examParam.name,
                description: examParam.description,
                subscriptionAmount: examParam.subscriptionAmount,
            })
        } catch (error) {
            throw error
        }
    }

    async AddCourse(courseParams: Course): Promise<void> {
        try {
            await this.db.insert(Courses).values({
                name: courseParams.name,
                examId: courseParams.examId
            })
        } catch (error) {
            throw error
        }
    }

    async AddSubject(subjectParams: Subject): Promise<void> {
        try {
            await this.db.insert(Subjects).values({
                name: subjectParams.name,
                courseId: subjectParams.courseId
            })
        } catch (error) {
            throw error
        }
    }

    async AddQuestion(questionParams: Question): Promise<void> {
        try {
            await this.db.transaction(async (tx) => {
                try {
                    const newQuestionResults = await tx.insert(Questions).values({
                        description: questionParams.description,
                        question: questionParams.question,
                        explanation: questionParams.explanation,
                        subjectId: questionParams.subjectId
                    }).returning()
                    const newQuestion = newQuestionResults[0]
                    let index = 0
                    if (questionParams.options != undefined && questionParams.options.length > 0) {
                        for await (let optionParams of questionParams.options) {
                            await tx.insert(Options).values({
                                index: index,
                                value: optionParams.value,
                                answer: optionParams.answer,
                                explanation: optionParams.explanation,
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
            const updatedExam = await this.db.update(Exams).set(examParams).where(eq(Exams.id, id)).returning({id: Exams.id})
            if (updatedExam.length < 1) {
                throw new BadRequestError(`exam with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    async EditCourseName(id: string, name: string): Promise<void> {
        try {
            const updatedCourse = await this.db.update(Courses).set({name: name}).where(eq(Courses.id, id)).returning({id: Courses.id})
            if (updatedCourse.length < 1) {
                throw new BadRequestError(`course with id '${id}' does not exist`)
            }
        } catch (error) {
            throw error
        }
    }

    async EditSubjectName(id: string, name: string): Promise<void> {
        try {
            const updatedSubject = await this.db.update(Subjects).set({name: name}).where(eq(Subjects.id, id)).returning({id: Subjects.id})
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
                    const updatedQuestion = await tx.update(Questions).set(questionParams).where(eq(Questions.id, questionParams.id as string)).returning({id: Questions.id})
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


    // Get Many
    async GetExams(filter: PaginationFilter): Promise<{ exams: Exam[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Exams).where(and(...filters));
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
                            subscriptionAmount: row.subscriptionAmount as number,
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

    async GetCourses(filter: PaginationFilter):
        Promise<{ courses: Course[], metadata: PaginationMetaData }> {
        try {
            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Courses.name, `%${filter.name}%`));
            }

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Courses).where(and(...filters));
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

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Subjects).where(and(...filters));
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

            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Questions).where(and(...filters));
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
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
            })
            if (questions.length > 0) {
                return {
                    questions: questions.map((question: any): Question => {
                        return {
                            id: question.id as string,
                            description: question.description as string,
                            explanation: question.explanation as string,
                            question: question.question as string,
                            questionImageUrl: question.questionImageUrl as string,
                            explanationImageUrl: question.explanationImageUrl as string,
                            options: question.options?.map((option: any): Option => {
                                return {
                                    index: option.index,
                                    value: option.value,
                                    selected: option.selected,
                                    answer: option.answer,
                                    explanation: option.explanation
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
                subscriptionAmount: examResult[0].subscriptionAmount as number,
                imageURL: examResult[0].imageURL as string,
                createdAt: examResult[0].createdAt as Date,
                updatedAt: examResult[0].updatedAt as Date
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
                description: questionResult.description as string,
                explanation: questionResult.explanation as string,
                question: questionResult.question as string,
                questionImageUrl: questionResult.questionImageUrl as string,
                explanationImageUrl: questionResult.explanationImageUrl as string,
                options: questionResult.options?.map((option: any): Option => {
                    return {
                        index: option.index,
                        value: option.value,
                        selected: option.selected,
                        answer: option.answer,
                        explanation: option.explanation
                    }
                })
            }

        } catch (error) {
            throw error
        }
    }
}

