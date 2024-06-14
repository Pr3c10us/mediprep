import {ExamRepository} from "../../../../../domain/exams/repository";
import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {
    Course,
    EditExamParams,
    EditQuestionParams,
    Exam,
    Option,
    Question,
    Subject
} from "../../../../../domain/exams/exam";
import {Courses, Exams, Options, Questions, Subjects} from "../../../../../../../stack/drizzle/schema/exams"
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {and, eq, ilike, sql} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";

export class ExamRepositoryDrizzle implements ExamRepository {
    db

    constructor(db: NodePgDatabase) {
        this.db = db
    }

    async AddExam(examParam: Exam): Promise<void> {
        try {
            await this.db.insert(Exams).values({
                name: examParam.name,
                description: examParam.description,
            })
        } catch (error) {
            throw error
        }
    }

    async AddQuestion(subjectId: string, questionParams: Question): Promise<void> {
        try {
            const subjectExist = await this.db.select().from(Subjects).where(eq(Subjects.id, subjectId))
            if (subjectExist.length < 1) {
                throw new BadRequestError(`subject with subject id '${subjectId}' does not exist`)
            }
            await this.db.transaction(async (tx) => {
                try {
                    const newQuestionResults = await tx.insert(Questions).values({
                        description: questionParams.description,
                        question: questionParams.question,
                        explanation: questionParams.explanation,
                        subjectId: subjectId
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
                    tx.rollback()
                }
            })
        } catch (error) {
            throw error
        }
    }

    async AddCourse(examId: string, subjectParams: Subject): Promise<void> {
        try {
            const examExist = await this.db.select().from(Exams).where(eq(Exams.id, examId))
            if (examExist.length < 1) {
                throw new BadRequestError(`exam with exam id '${examId}' does not exist`)
            }
            await this.db.insert(Courses).values({
                name: subjectParams.name,
                examId: examId
            })
        } catch (error) {
            throw error
        }
    }

    async AddSubject(courseId: string, subjectParams: Subject): Promise<void> {
        try {
            const courseExist = await this.db.select().from(Courses).where(eq(Courses.id, courseId))
            if (courseExist.length < 1) {
                throw new BadRequestError(`course with course id '${courseId}' does not exist`)
            }
            await this.db.insert(Subjects).values({
                name: subjectParams.name,
                courseId: courseId
            })
        } catch (error) {
            throw error
        }
    }

    async DeleteExam(id: string): Promise<void> {
        try {
            await this.db.delete(Exams).where(eq(Exams.id, id))
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

    async EditExam(id: string, examParams: EditExamParams): Promise<void> {
        try {
            await this.db.update(Exams).set(examParams).where(eq(Exams.id, id))
        } catch (error) {
            throw error
        }
    }

    async EditQuestion(id: string, questionParams: EditQuestionParams): Promise<void> {
        try {
            await this.db.transaction(async (tx) => {
                try {
                    await tx.update(Questions).set(questionParams).where(eq(Questions.id, id))
                    if (questionParams.options != undefined && questionParams.options.length > 0) {
                        for await (let option of questionParams.options) {
                            await tx.update(Options).set(option).where(eq(Options.index, option.index))
                        }
                    }
                    return
                } catch (error) {
                    tx.rollback()
                }
            })
        } catch (error) {
            throw error
        }
    }

    async EditCourseName(id: string, name: string): Promise<void> {
        try {
            await this.db.update(Courses).set({name: name}).where(eq(Courses.id, id))
        } catch (error) {
            throw error
        }
    }

    async EditSubjectName(id: string, name: string): Promise<void> {
        try {
            await this.db.update(Subjects).set({name: name}).where(eq(Subjects.id, id))
        } catch (error) {
            throw error
        }
    }

    async GetExams(filter: PaginationFilter): Promise<{ exams: Exam[], metadata: PaginationMetaData }> {
        try {
            // Get the total count of rows
            const totalResult = await this.db.select({count: sql`count(*)`}).from(Exams);
            const total = parseInt(<string>totalResult[0].count || '0', 10);
            if (total <= 0) {
                return {
                    exams: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Exams.name, `%${filter.name}%`));
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
                            imageURL: row.imageUrl as string,
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

    async GetQuestions(filter: PaginationFilter): Promise<{ questions: Question[], metadata: PaginationMetaData }> {
        try {
            // Get the total count of rows
            const totalResult = await this.db.select({count: sql`count(*)`}).from(Questions);
            const total = parseInt(<string>totalResult[0].count || '0', 10);
            if (total <= 0) {
                return {
                    questions: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const query = this.db.select().from(Questions);

            const rows = await query
                .limit(filter.limit)
                .offset((filter.page - 1) * filter.limit);
            if (rows.length > 0) {
                let questions: Question[] = []
                for await (let row of rows) {
                    const options = await this.db.select().from(Options).where(eq(Options.questionId, row.id as string))
                    const question : Question = {
                        id: row.id as string,
                        description: row.description as string,
                        question: row.question as string,
                        questionImageUrl: row.questionImageUrl as string,
                        explanation: row.explanation as string,
                        explanationImageUrl: row.explanationImageUrl as string,
                        options: options.map((option): Option => {
                            return {
                                index: option.index as number,
                                value: option.value as string,
                                selected: option.selected as number,
                                answer: option.answer as boolean
                            }
                        })
                    }
                    questions.push(question)
                }
                return {
                    questions, metadata: {
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

    async GetCourses(filter: PaginationFilter):
        Promise<{ courses: Course[], metadata: PaginationMetaData }> {
        try {
            // Get the total count of rows
            const totalResult = await this.db.select({count: sql`count(*)`}).from(Courses);
            const total = parseInt(<string>totalResult[0].count || '0', 10);
            if (total <= 0
            ) {
                return {
                    courses: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Courses.name, `%${filter.name}%`));
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
            // Get the total count of rows
            const totalResult = await this.db.select({count: sql`count(*)`}).from(Subjects);
            const total = parseInt(<string>totalResult[0].count || '0', 10);
            if (total <= 0
            ) {
                return {
                    subjects: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }

            const filters: string | any[] = [];
            if (filter.name || filter.name != undefined) {
                filters.push(ilike(Subjects.name, `%${filter.name}%`));
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


    async GetExamById (id: string) : Promise<Exam> {
    try {
        const examResult = await this.db.select().from(Exams).where(eq(Exams.id,id))
        if (examResult.length < 1) {
            throw new BadRequestError(`exam with id '${id}' does not exist`)
        }
        return {
            id: examResult[0].id as string,
            name:  examResult[0].name as string,
            description:  examResult[0].description as string,
            imageURL: examResult[0].imageUrl as string,
            createdAt: examResult[0].createdAt as Date,
            updatedAt:  examResult[0].updatedAt as Date
        }
    } catch (error) {
        throw error
    }
}

}