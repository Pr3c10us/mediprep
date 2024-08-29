import {TestsServices} from "../../../../../app/test/test";
import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {createTestSchema, scoreTestSchema, testIdSchema} from "../../../../../../pkg/validations/test";
import {getCommandFilterSchema, paginationSchema, userExamIdSchema} from "../../../../../../pkg/validations/exam";
import {CheckExamAccess} from "../../../../../../pkg/middleware/checkExamAccess";
import {UserExamAccessService} from "../../../../../app/examAccess/examAccess";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";
import {Test, TestType, UserAnswer} from "../../../../../domain/tests/test";
import {QuestionStatus} from "../../../../../domain/exams/exam";

export class TestsHandler {
    testServices: TestsServices
    router: Router

    constructor(testServices: TestsServices, userExamAccessService: UserExamAccessService) {
        this.testServices = testServices
        this.router = Router()

        this.router.route("/:examId")
            .post(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(createTestSchema, "body"),
                CheckExamAccess(userExamAccessService),
                this.createTest
            )
            .get(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(getCommandFilterSchema, "query"),
                CheckExamAccess(userExamAccessService),
                this.getTests
            )

        this.router.route("/:examId/questions")
            .get(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(paginationSchema, "query"),
                CheckExamAccess(userExamAccessService),
                this.getExamQuestions
            )

        this.router.route("/:examId/:testId")
            .post(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                ValidationMiddleware(scoreTestSchema, "body"),
                CheckExamAccess(userExamAccessService),
                this.scoreTest
            )
            .get(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                ValidationMiddleware(getCommandFilterSchema, "query"),
                CheckExamAccess(userExamAccessService),
                this.getTestQuestions
            )

        this.router.route("/:examId/:testId/end")
            .post(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                CheckExamAccess(userExamAccessService),
                this.endTest
            )

        this.router.route("/:examId/:testId/pause")
            .post(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                CheckExamAccess(userExamAccessService),
                this.pauseTest
            )

        this.router.route("/:examId/:testId/resume")
            .post(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                CheckExamAccess(userExamAccessService),
                this.resumeTest
            )

        this.router.route("/:examId/:testId/analytics")
            .get(
                ValidationMiddleware(userExamIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                ValidationMiddleware(getCommandFilterSchema, "query"),
                CheckExamAccess(userExamAccessService),
                this.getTestAnalytics
            )
    }

    createTest = async (req: Request, res: Response) => {
        const testParams: PartialWithRequired<Test, "questions" | "questionMode" | "endTime" | "type" | "examId" | "userId"> = {
            questions: req.body.questions,
            questionMode: req.body.questionMode,
            userId: req.userD?.id as string,
            examId: req.params.examId,
            endTime: new Date(req.body.endTime),
            type: req.body.type,
            subjectIds: req.body.subjectIds || null,
            courseIds: req.body.courseIds || null,
        }
        const testId = await this.testServices.commands.createTest.Handle(testParams)

        new SuccessResponse(res, {testId}).send();
    }

    getTests = async (req: Request, res: Response) => {
        const {limit, page, testType,status, startDate, endDate} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            testType: testType ? testType as TestType : undefined,
            userId: req.userD?.id as string,
            status: status as string || undefined
        };
        const {tests, metadata} = await this.testServices.queries.getTests.Handle(filter)

        new SuccessResponse(res, {tests}, metadata).send();
    }

    getTestAnalytics = async (req: Request, res: Response) => {
        const {
            test,
            questions
        } = await this.testServices.queries.getTestDetails.Handle(req.params.testId, req.userD?.id as string)

        new SuccessResponse(res, {test, questions}).send();
    }

    scoreTest = async (req: Request, res: Response) => {
        const {answers} = req.body
        const testId = req.params.testId
        const userId = req.userD?.id as string

        const id = await this.testServices.commands.scoreTest.Handle(testId, userId, answers as UserAnswer[])

        new SuccessResponse(res, {testId: id}).send();
    }

    endTest = async (req: Request, res: Response) => {
        const testId = req.params.testId
        const userId = req.userD?.id as string

        await this.testServices.commands.endTest.Handle(testId, userId)

        new SuccessResponse(res, {message: "test ended"}).send();
    }

    pauseTest = async (req: Request, res: Response) => {
        const testId = req.params.testId
        const userId = req.userD?.id as string

        await this.testServices.commands.pauseTest.Handle(testId, userId)

        new SuccessResponse(res, {message: "test paused"}).send();
    }

    resumeTest = async (req: Request, res: Response) => {
        const testId = req.params.testId
        const userId = req.userD?.id as string

        const testIde = await this.testServices.commands.resumeTest.Handle(testId, userId)

        new SuccessResponse(res, {message: "test paused", testIde}).send();
    }

    getTestQuestions = async (req: Request, res: Response) => {
        const testId = req.params.testId
        const userId = req.userD?.id as string

        const questions = await this.testServices.queries.getTestQuestions.Handle(testId, userId)

        new SuccessResponse(res, {questions}).send();
    }

    getExamQuestions = async (req: Request, res: Response) => {
        const filter: PaginationFilter = {
            userId: req.userD?.id,
            examId: req.params.examId,
            limit: Number(req.query.limit) || 10,
            page: Number(req.query.page) || 1,
            questionStatus: req.query.questionStatus as QuestionStatus
        }
        const questionsResponse = await this.testServices.queries.getExamQuestions.Handle(filter)
        new SuccessResponse(res, {questions: questionsResponse.questions}, questionsResponse.metadata).send();
    }
}