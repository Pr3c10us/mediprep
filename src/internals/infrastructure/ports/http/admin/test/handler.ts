import {TestsServices} from "../../../../../app/test/test";
import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {testIdSchema} from "../../../../../../pkg/validations/test";
import {getCommandFilterSchema, userExamIdSchema} from "../../../../../../pkg/validations/exam";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";
import {TestType} from "../../../../../domain/tests/test";
import {AuthorizeAdmin} from "../../../../../../pkg/middleware/authorization";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import {AdminServices} from "../../../../../app/admin/admin";
import {userIdSchema} from "../../../../../../pkg/validations/user";

export class TestsHandler {
    testServices: TestsServices
    router: Router

    constructor(testServices: TestsServices, adminServices: AdminServices) {
        this.testServices = testServices
        this.router = Router()

        this.router.route("/:id")
            .get(
                ValidationMiddleware(userIdSchema, "params"),
                ValidationMiddleware(getCommandFilterSchema, "query"),
                AuthorizeAdmin(adminServices.adminRepository),
                CheckPermission("read_user"),
                this.getTests
            )


        this.router.route("/:id/:testId/analytics")
            .get(
                ValidationMiddleware(userIdSchema, "params"),
                ValidationMiddleware(testIdSchema, "params"),
                AuthorizeAdmin(adminServices.adminRepository),
                CheckPermission("read_user"),
                this.getTestAnalytics
            )
    }


    getTests = async (req: Request, res: Response) => {
        const {limit, page, testType, startDate, endDate} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            testType: testType ? testType as TestType : undefined,
            userId: req.params.id
        };
        const {tests, metadata} = await this.testServices.queries.getTests.Handle(filter)

        new SuccessResponse(res, {tests}, metadata).send();
    }

    getTestAnalytics = async (req: Request, res: Response) => {
        const {
            test,
            questions
        } = await this.testServices.queries.getTestDetails.Handle(req.params.testId, req.params.id)

        new SuccessResponse(res, {test, questions}).send();
    }

}