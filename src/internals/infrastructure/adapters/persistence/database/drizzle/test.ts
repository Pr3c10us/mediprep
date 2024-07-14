import {TestRepository} from "../../../../../domain/tests/repository";
import {Test, TestMode, TestType, UserAnswer} from "../../../../../domain/tests/test";
import {Option, Question, QuestionStatus, QuestionType} from "../../../../../domain/exams/exam";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "../../../../../../../stack/drizzle/schema/exams";
import {
    Exams,
    Options,
    Question as QuestionT,
    Questions,
    UserQuestionRecords
} from "../../../../../../../stack/drizzle/schema/exams";
import * as schema2 from "../../../../../../../stack/drizzle/schema/test";
import {TestQuestionRecords, Tests} from "../../../../../../../stack/drizzle/schema/test";
import {and, count, eq, gte, inArray, lte, notInArray, sql} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";

export class TestRepositoryDrizzle implements TestRepository {
    db

    constructor(client: PoolClient) {
        this.db = drizzle(client, {
            schema: {
                ...schema, ...schema2
            }
        })
    }

    getTests = async (filter: PaginationFilter): Promise<{ tests: Test[]; metadata: PaginationMetaData }> => {
        let filters = []
        if (filter.startDate || filter.startDate != undefined) {
            filters.push(gte(Tests.createdAt, filter.startDate as Date))
        }
        if (filter.endDate || filter.endDate != undefined) {
            filters.push(lte(Tests.createdAt, filter.endDate as Date))
        }
        if (filter.testType || filter.testType != undefined) {
            filters.push(eq(Tests.type, filter.testType as string))
        }
        if (filter.userId || filter.userId != undefined) {
            filters.push(eq(Tests.userId, filter.userId as string))
        }
        // Get the total count of rows
        const totalResult = await this.db.select({count: count()}).from(Tests).where(and(...filters));
        const total = totalResult[0].count;
        if (total <= 0) {
            return {
                tests: [], metadata: {
                    total: 0,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            }
        }
        const tests = await this.db.query.Tests.findMany({
            where: and(...filters),
            limit: filter.limit,
            offset: (filter.page - 1) * filter.limit,
            orderBy: Tests.createdAt
        });
        if (tests.length > 0) {
            return {
                tests: tests.map((test): Test => {
                    return {
                        id: test.id as string,
                        userId: test.userId as string,
                        examId: test.examId as string,
                        type: test.type as TestType,
                        createdAt: test.createdAt as Date,
                        updatedAt: test.updatedAt as Date,
                        score: test.score as number,
                        questions: test.questions as number,
                        correctAnswers: test.correctAnswers as number,
                        incorrectAnswers: test.incorrectAnswers as number,
                        unansweredQuestions: test.unansweredQuestions as number,
                        questionMode: test.examId as TestMode,
                        subjectId: test.subjectId as string,
                        courseId: test.courseId as string,
                        endTime: test.endTime as Date,
                    }
                }), metadata: {
                    total: total,
                    perPage: filter.limit,
                    currentPage: filter.page
                }
            }
        }
        return {tests: [], metadata: {total: 0, perPage: filter.limit, currentPage: filter.page}}
    }

    CreateTest = async (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">): Promise<string> => {
        try {
            return await this.db.transaction(async (tx): Promise<string> => {
                try {
                    const exam = await tx.query.Exams.findFirst({
                        where: eq(Exams.id, test.examId)
                    })
                    if (!exam) throw new BadRequestError("exam does not exist")

                    if (test.type == "mock") {
                        test.questions = exam.mockQuestions as number
                    }
                    let filters = []
                    if (test.type == "subjectBased") {
                        if (test.subjectId) {
                            filters.push(eq(Questions.subjectId, test.subjectId))
                        } else {
                            throw new BadRequestError(("pass valid subject id"))
                        }
                    } else if (test.type == "courseBased") {
                        if (test.courseId) {
                            filters.push(eq(Questions.courseId, test.courseId))
                        } else {
                            throw new BadRequestError(("pass valid course id"))
                        }
                    } else {
                        if (test.examId) {
                            filters.push(eq(Questions.examId, test.examId))
                        } else {
                            throw new BadRequestError(("pass valid course id"))
                        }
                    }
                    // fetch all user questions record
                    const userQuestionsRes = await tx.query.UserQuestionRecords.findMany({
                        where: and(eq(UserQuestionRecords.userId, test.userId), eq(UserQuestionRecords.examId, test.examId)),
                        columns: {
                            questionId: true
                        }
                    })
                    const userQuestions: string[] = userQuestionsRes.map((question) => question.questionId)
                    if (test.questionMode == "used") {
                        filters.push(inArray(Questions.id, userQuestions))
                    } else {
                        filters.push(notInArray(Questions.id, userQuestions))
                    }

                    const questionsRes = await tx.query.Questions.findMany({
                        where: and(...filters),
                        columns: {
                            id: true,
                            type: true,
                            subjectId: true,
                            courseId: true,
                            examId: true,
                        },
                        limit: test.questions,
                        orderBy: sql`RANDOM
                        ()`
                    })

                    const testRes = await tx.insert(Tests).values(test).returning({id: Tests.id})
                    if (testRes.length <= 0) throw new BadRequestError("Test failed to creat")
                    const testId = testRes[0].id as string

                    const questions = questionsRes.map((question) => {
                        return {
                            testId,
                            userId: test.userId,
                            questionType: question.type,
                            questionId: question.id as string,
                            subjectId: question.subjectId as string,
                            courseId: question.courseId as string,
                            examId: question.examId as string
                        }
                    })

                    await tx.insert(TestQuestionRecords).values(questions)
                    await tx.insert(UserQuestionRecords).values(questions)
                    return testId
                } catch (error) {
                    tx.rollback()
                    throw error
                }
            })
        } catch (error) {
            throw error
        }
    }

    getTestQuestions = async (testId: string, userId: string): Promise<Question[]> => {
        try {
            // fetch all user questions record
            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionId: true
                }
            })
            let filters = []
            const userQuestions: string[] = testQuestionsRes.map((question) => question.questionId)
            filters.push(inArray(Questions.id, userQuestions))

            const questionsRes: QuestionT[] = await this.db.query.Questions.findMany({
                where: and(...filters),
                with: {
                    options: true,
                },
                orderBy: sql`RANDOM
                ()`
            })
            return questionsRes.map((question): Question => {
                return {
                    id: question?.id as string,
                    type: question?.type as QuestionType,
                    explanation: question?.explanation as string,
                    question: question?.question as string,
                    questionImageUrl: question?.questionImageUrl as string,
                    explanationImageUrl: question?.explanationImageUrl as string,
                    options: question?.options?.map((option: any): Option => {
                        return {
                            id: option.id,
                            index: option.index,
                            value: option.value,
                            selected: option.selected,
                            answer: option.answer,
                            explanation: option.explanation
                        }
                    })
                }
            })
        } catch (error) {
            throw error
        }
    }

    scoreTest = async (testId: string, userId: string, answers: UserAnswer[]): Promise<string> => {
        try {
            // fetch all user questions record
            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionId: true
                }
            })
            let filters = []
            const userQuestions: string[] = testQuestionsRes.map((question) => question.questionId)
            filters.push(inArray(Questions.id, userQuestions))

            const questionsRes: QuestionT[] = await this.db.query.Questions.findMany({
                where: and(...filters),
                with: {
                    options: true,
                },
            })

            let correctAnswers: number = 0
            let incorrectAnswers: number = 0
            let unansweredQuestions: number = 0

            for await (const answer of answers) {
                let status: QuestionStatus = "unanswered"
                const question = questionsRes.find((question) => question?.id === answer.questionId)
                const options = question?.options?.map((option: any): Option => {
                    return {
                        id: option.id,
                        index: option.index,
                        value: option.value,
                        selected: option.selected,
                        answer: option.answer,
                        explanation: option.explanation
                    }
                })
                if (question?.type == "singleChoice" && answer.option) {
                    const selectedOption = options?.find((option) => option.id == answer.option)
                    if (selectedOption) {
                        const correctOption = options?.find((option) => option.answer)
                        if (correctOption && (correctOption.id == selectedOption.id)) {
                            status = "correct"
                            correctAnswers += 1
                        } else {
                            status = "wrong"
                            incorrectAnswers += 1
                        }
                        await this.db.update(Options).set({selected: selectedOption.selected as number + 1}).where(eq(Options.id, selectedOption.id as string))
                        await this.db.update(TestQuestionRecords).set({
                            questionStatus: status,
                            optionId: selectedOption.id
                        }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                    }
                } else if (question?.type == "singleChoice" && answer.options && answer.options.length > 0) {
                    const selectedOptions = options?.filter((option) => answer.options?.includes(option.id as string))
                    if (selectedOptions && selectedOptions.length > 0) {
                        const correctOptions = options?.filter((option) => option.answer)
                        if (correctOptions && (selectedOptions.length === correctOptions.length) && (selectedOptions.every((element, index) => element === correctOptions[index]))) {
                            status = "correct"
                            correctAnswers += 1
                        } else {
                            status = "wrong"
                            incorrectAnswers += 1
                        }
                        for await (let option of selectedOptions) {
                            await this.db.update(Options).set({selected: option.selected as number + 1}).where(eq(Options.id, option.id as string))
                        }
                        const ids = selectedOptions.map((option) => option.id as string)
                        await this.db.update(TestQuestionRecords).set({
                            questionStatus: status,
                            options: ids
                        }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                    }
                } else if (question?.type == "fillInTheGap" && answer.answer) {
                    const correctOptions = options?.filter((option) => option.value == answer.answer)
                    if (correctOptions && correctOptions.length > 0) {
                        status = "correct"
                        correctAnswers += 1
                    } else {
                        status = "wrong"
                        incorrectAnswers += 1
                    }
                    await this.db.update(TestQuestionRecords).set({
                        questionStatus: status,
                        answer: answer.answer
                    }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                }
                if (status == "unanswered") unansweredQuestions += 1
            }

            const testUpdate = {
                correctAnswers,
                incorrectAnswers,
                unansweredQuestions,
                score: (correctAnswers / (incorrectAnswers + unansweredQuestions + correctAnswers)) * 100
            }
            await this.db.update(Tests).set(testUpdate).where(eq(Tests.id, testId))
            return testId
        } catch (error) {
            throw error
        }

    }

}