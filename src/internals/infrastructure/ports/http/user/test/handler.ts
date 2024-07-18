import {TestsServices} from "../../../../../app/test/test";
import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {createTestSchema, scoreTestSchema, testIdSchema} from "../../../../../../pkg/validations/test";
import {getCommandFilterSchema, userExamIdSchema} from "../../../../../../pkg/validations/exam";
import {CheckExamAccess} from "../../../../../../pkg/middleware/checkExamAccess";
import {UserExamAccessService} from "../../../../../app/examAccess/examAccess";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";
import {TestType, UserAnswer} from "../../../../../domain/tests/test";

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
    }

    createTest = async (req: Request, res: Response) => {
        const testParams = {
            questions: req.body.questions,
            questionMode: req.body.questionMode,
            userId: req.user?.id as string,
            examId: req.params.examId,
            endTime: new Date(),
            type: req.body.type,
            subjectId: req.body.subjectId || null,
            courseId: req.body.courseId || null,
        }
        const testId = await this.testServices.commands.createTest.Handle(testParams)

        new SuccessResponse(res, {testId}).send();
    }

    getTests = async (req: Request, res: Response) => {
        const {limit, page, testType, startDate, endDate} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            testType: testType ? testType as TestType : undefined,
            userId: req.user?.id as string
        };
        const {tests, metadata} = await this.testServices.queries.getTests.Handle(filter)

        new SuccessResponse(res, {tests}, metadata).send();
    }

    scoreTest = async (req: Request, res: Response) => {
        const {answers} = req.body
        const testId = req.params.testId
        const userId = req.user?.id as string

        const id = await this.testServices.commands.scoreTest.Handle(testId, userId, answers as UserAnswer[])

        new SuccessResponse(res, {testId: id}).send();
    }

    getTestQuestions = async (req: Request, res: Response) => {
        const testId = req.params.testId
        const userId = req.user?.id as string

        const questions = await this.testServices.queries.getTestQuestions.Handle(testId, userId)

        new SuccessResponse(res, {questions}).send();
    }
}