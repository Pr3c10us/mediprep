import {TestRepository} from "../../../../../domain/tests/repository";
import {Test, TestAnalytics, TestMode, TestType, UserAnswer} from "../../../../../domain/tests/test";
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
import {and, count, eq, gte, inArray, lte, ne, notInArray, sql} from "drizzle-orm";
import {BadRequestError, NotFoundError} from "../../../../../../pkg/errors/customError";
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


    getTestAnalytics = async (testId: string, userId: string): Promise<{ test: Test, questions: Question[] }> => {
        try {
            const testRes = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId)),
            });
            if (!testRes) throw new NotFoundError(`no test with id ${testId}`)
            const test: Test = {
                id: testRes.id as string,
                status: testRes.status,
                userId: testRes.userId as string,
                examId: testRes.examId as string,
                type: testRes.type as TestType,
                createdAt: testRes.createdAt as Date,
                updatedAt: testRes.updatedAt as Date,
                score: testRes.score as number,
                questions: testRes.questions as number,
                correctAnswers: testRes.correctAnswers as number,
                incorrectAnswers: testRes.incorrectAnswers as number,
                unansweredQuestions: testRes.unansweredQuestions as number,
                questionMode: testRes.questionMode as TestMode,
                subjectId: testRes.subjectId as string,
                courseId: testRes.courseId as string,
                endTime: testRes.endTime as Date,
                timeLeft: testRes.timeLeft as number
            }

            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionStatus: true,
                    questionType: true,
                    questionId: true,
                    optionId: true,
                    options: true,
                    answer: true,
                }
            })

            const questionsResult = await this.getTestQuestions(testId, userId)

            const questions = questionsResult.map((questionData) => {
                const result = testQuestionsRes.find((question) => question.questionId == questionData.id)
                if (result) {
                    questionData.questionStatus = result.questionStatus as QuestionStatus
                    if (questionData.type == "single_choice") {
                        questionData.selectedAnswer = result.optionId as string
                    } else if (questionData.type == "multiple_choice") {
                        questionData.selectedAnswer = result.options as string[]
                    } else {
                        questionData.selectedAnswer = result.answer as string
                    }
                }

                return questionData
            })

            return {test, questions}
        } catch (error) {
            throw error
        }
    }

    getExamTestAnalytics = async (userId: string, examId: string): Promise<TestAnalytics> => {
        try {
            const allQuestions = await this.db.query.Questions.findMany({
                where: eq(Questions.examId, examId),
                columns: {
                    id: true
                }
            })
            const allTest = await this.db.query.Tests.findMany({
                where: and(and(eq(Tests.userId, userId), eq(Tests.examId, examId)), ne(Tests.type, "mock")),
                columns: {
                    score: true
                }
            })

            let totalTestScore: number = 0
            let totalTest = allTest.length

            allTest.forEach((test) => {
                totalTestScore += test.score
            })

            const allMocks = await this.db.query.Tests.findMany({
                where: and(and(eq(Tests.userId, userId), eq(Tests.examId, examId)), eq(Tests.type, "mock")),
                columns: {
                    score: true
                }
            })

            let totalMockScore: number = 0
            let totalMocks = allMocks.length

            allMocks.forEach((test) => {
                totalMockScore += test.score
            })


            const usedQuestions = await this.db.query.UserQuestionRecords.findMany({
                where: and(eq(UserQuestionRecords.userId, userId), eq(UserQuestionRecords.examId, examId)),
                columns: {
                    id: true
                }
            })

            return {
                totalQuestions: allQuestions.length,
                usedQuestions: usedQuestions.length,
                totalTest,
                testAveragePercent: totalTestScore / totalTest,
                totalMocks,
                mockAveragePercent: totalMockScore / totalMocks,
            }

        } catch (error) {
            throw error
        }
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
        if (filter.status || filter.status != undefined) {
            filters.push(eq(Tests.status, filter.status as string))
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
                        status: test.status,
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
                        questionMode: test.questionMode as TestMode,
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

    CreateTest = async (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">): Promise<{
        testId: string,
        endTime: Date
    }> => {
        try {
            return await this.db.transaction(async (tx): Promise<{ testId: string, endTime: Date }> => {
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
                            throw new BadRequestError("pass valid course id")
                        }
                    } else {
                        if (test.examId) {
                            filters.push(eq(Questions.examId, test.examId))
                        } else {
                            throw new BadRequestError("pass valid course id")
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
                    if (userQuestions.length > 0 && test.questionMode !== "all") {
                        if (test.questionMode == "used") {
                            filters.push(inArray(Questions.id, userQuestions))
                        } else {
                            filters.push(notInArray(Questions.id, userQuestions))
                        }
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
                        limit: test.questions < exam.mockQuestions ? test.questions : exam.mockQuestions,
                        orderBy: sql`RANDOM
                        ()`
                    })
                    if (questionsRes.length <= 0) {
                        throw new NotFoundError(`no more ${test.questionMode} questions`)
                    }
                    test.questions = questionsRes.length
                    const testRes = await tx.insert(Tests).values(test).returning({
                        id: Tests.id,
                        endTime: Tests.endTime
                    })
                    if (testRes.length <= 0) throw new BadRequestError("Test failed to creat")
                    const testId = testRes[0].id as string
                    const endTime = testRes[0].endTime as Date

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

                    const newUsedQuestion = questions.filter((question) => !userQuestions.includes(question.questionId))
                    if (newUsedQuestion.length > 0) {
                        await tx.insert(UserQuestionRecords).values(newUsedQuestion)
                    }
                    await tx.insert(TestQuestionRecords).values(questions)

                    return {testId, endTime}
                } catch (error) {
                    console.log(error)
                    try {
                        tx.rollback()
                        throw error
                    } catch (e) {
                        throw error
                    }
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
            if (testQuestionsRes.length <= 0) {
                throw new NotFoundError("No questions for this test")
            }
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
            // fetch test
            const test = await this.db.query.Tests.findFirst({
                where: eq(Tests.id, testId)
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test completed ")
            }
            // fetch all user questions record
            const testQuestionsRes = await this.db.query.TestQuestionRecords.findMany({
                where: and(eq(TestQuestionRecords.userId, userId), eq(TestQuestionRecords.testId, testId)),
                columns: {
                    questionId: true,
                    questionStatus: true
                }
            })
            if (testQuestionsRes.length <= 0) {
                throw new NotFoundError("No questions for this test")
            }
            let filters = []
            const userQuestions: string[] = testQuestionsRes.map((question) => question.questionId)
            filters.push(inArray(Questions.id, userQuestions))

            const questionsRes: QuestionT[] = await this.db.query.Questions.findMany({
                where: and(...filters),
                with: {
                    options: true,
                },
            })

            let correctAnswers: number = test.correctAnswers as number
            let incorrectAnswers: number = test.incorrectAnswers as number
            let unansweredQuestions: number = test.unansweredQuestions as number

            let answeredQuestions: string[] = []

            for await (const answer of answers) {
                console.log(answer)
                let status: QuestionStatus = "unanswered"
                const question = questionsRes.find((question) => question?.id === answer.questionId)
                if (!question) {
                    continue
                }
                const questionExist = answeredQuestions.find((questionId) => questionId === answer.questionId)
                if (questionExist) {
                    continue
                }
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
                const previousQuestionStatus = testQuestionsRes.find((question) => answer.questionId == question.questionId)
                if (!previousQuestionStatus) {
                    continue
                }
                if (question?.type == "single_choice" && answer.option) {
                    const selectedOption = options?.find((option) => option.id == answer.option)
                    if (selectedOption) {
                        const correctOption = options?.find((option) => option.answer)

                        if (correctOption && (correctOption.id == selectedOption.id)) {
                            status = "correct"
                            if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                            if (previousQuestionStatus.questionStatus == "wrong") {
                                correctAnswers += 1
                                incorrectAnswers -= 1
                            }
                            // if (previousQuestionStatus.questionStatus == "correct") {}

                        } else {
                            status = "wrong"

                            if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                            if (previousQuestionStatus.questionStatus == "correct") {
                                correctAnswers -= 1
                                incorrectAnswers += 1
                            }
                            // if (previousQuestionStatus.questionStatus == "wrong") {}
                        }
                        await this.db.update(Options).set({selected: selectedOption.selected as number + 1}).where(eq(Options.id, selectedOption.id as string))
                        await this.db.update(TestQuestionRecords).set({
                            questionStatus: status,
                            optionId: selectedOption.id
                        }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                    }
                } else if (question?.type == "multiple_choice" && answer.options && answer.options.length > 0) {
                    const selectedOptions = options?.filter((option) => answer.options?.includes(option.id as string))
                    if (selectedOptions && selectedOptions.length > 0) {
                        const correctOptions = options?.filter((option) => option.answer)
                        if (correctOptions && (selectedOptions.length === correctOptions.length) && (selectedOptions.every((element, index) => element === correctOptions[index]))) {
                            status = "correct"
                            if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                            if (previousQuestionStatus.questionStatus == "wrong") {
                                correctAnswers += 1
                                incorrectAnswers -= 1
                            }
                            // if (previousQuestionStatus.questionStatus == "correct") {}
                        } else {
                            status = "wrong"

                            if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                            if (previousQuestionStatus.questionStatus == "correct") {
                                correctAnswers -= 1
                                incorrectAnswers += 1
                            }
                            // if (previousQuestionStatus.questionStatus == "wrong") {}
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
                } else if (question?.type == "fill_in_the_blanks" && answer.answer) {
                    const correctOptions = options?.filter((option) => option.value == answer.answer)
                    if (correctOptions && correctOptions.length > 0) {
                        status = "correct"
                        if (previousQuestionStatus.questionStatus == "unanswered") correctAnswers += 1
                        if (previousQuestionStatus.questionStatus == "wrong") {
                            correctAnswers += 1
                            incorrectAnswers -= 1
                        }
                        // if (previousQuestionStatus.questionStatus == "correct") {}
                    } else {
                        status = "wrong"

                        if (previousQuestionStatus.questionStatus == "unanswered") incorrectAnswers += 1
                        if (previousQuestionStatus.questionStatus == "correct") {
                            correctAnswers -= 1
                            incorrectAnswers += 1
                        }
                        // if (previousQuestionStatus.questionStatus == "wrong") {}
                    }
                    await this.db.update(TestQuestionRecords).set({
                        questionStatus: status,
                        answer: answer.answer
                    }).where(eq(TestQuestionRecords.questionId, answer.questionId))
                }
                if (status == "unanswered") unansweredQuestions += 1
                answeredQuestions.push(answer.questionId)
            }

            const testUpdate = {
                correctAnswers,
                // status: "complete",
                incorrectAnswers,
                unansweredQuestions: questionsRes.length - (correctAnswers + incorrectAnswers),
                score: (correctAnswers / questionsRes.length) * 100
            }
            await this.db.update(Tests).set(testUpdate).where(eq(Tests.id, testId))
            return testId
        } catch (error) {
            throw error
        }

    }

    pauseTestStatus = async (testId: string, userId: string): Promise<void> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test completed ")
            }

            const endTime = test.endTime as Date
            const timeLeft = (endTime.getTime() - new Date().getTime()) / 1000

            await this.db.update(Tests).set({
                status: 'paused',
                timeLeft: Math.round(timeLeft),
            }).where(eq(Tests.id, testId))


        } catch (error) {
            throw error
        }
    }

    resumeTestStatus = async (testId: string, userId: string): Promise<{ testId: string, timeLeft: number }> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "paused") {
                throw new BadRequestError("test is not paused ")
            }

            if (test.timeLeft < 1) {
                await this.db.update(Tests).set({
                    status: 'complete',
                }).where(eq(Tests.id, testId))
                throw new BadRequestError("test completed ")
            }

            const timeLeft = test.timeLeft as number
            const endTime = new Date((timeLeft * 1000) + (new Date().getTime()))


            await this.db.update(Tests).set({
                status: 'inProgress',
                endTime,
            }).where(eq(Tests.id, testId))

            return {
                timeLeft,
                testId: test.id as string
            }
        } catch (error) {
            throw error
        }
    }

    endTest = async (testId: string, userId: string): Promise<void> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId), eq(Tests.userId, userId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test not in progress ")
            }

            await this.db.update(Tests).set({
                status: 'complete',
                timeLeft: 0,
            }).where(eq(Tests.id, testId))

        } catch (error) {
            throw error
        }
    }

    forceEndTest = async (testId: string): Promise<void> => {
        try {
            const test = await this.db.query.Tests.findFirst({
                where: and(eq(Tests.id, testId))
            })
            if (!test) {
                throw new BadRequestError("test does not exist")
            }
            if (test.status !== "inProgress") {
                throw new BadRequestError("test not in progress ")
            }

            await this.db.update(Tests).set({
                status: 'complete',
                timeLeft: 0,
            }).where(eq(Tests.id, testId))

        } catch (error) {
            throw error
        }
    }

}