import {ExamServices} from "../../../../../app/exam/exam";
import {AdminServices} from "../../../../../app/admin/admin";
import {NextFunction, Request, Response, Router} from "express";
import {ExamHandler as AdminExamHAndler} from "../../admin/exam/handler";
import {ExamHandler} from "./handler";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {
    courseIdSchema,
    getCommandFilterSchema, paginationSchema,
    questionIdSchema,
    userExamIdSchema
} from "../../../../../../pkg/validations/exam";
import {UserExamAccessService} from "../../../../../app/examAccess/examAccess";
import {CheckExamAccess} from "../../../../../../pkg/middleware/checkExamAccess";
import {z} from "zod";

export class ExamRouter {
    router: Router;
    adminExamHandler: AdminExamHAndler
    examHandler: ExamHandler

    constructor(examServices: ExamServices, adminServices: AdminServices, userExamAccessService: UserExamAccessService) {
        this.router = Router();
        this.adminExamHandler = new AdminExamHAndler(examServices, adminServices)
        this.examHandler = new ExamHandler(examServices, userExamAccessService)

        this.router.route('/').get(
            this.adminExamHandler.getExamsHandler
        )
        this.router.route('/exams/:examId').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            this.examHandler.getExamDetails
        )

        this.router.route('/paid').get(
            this.examHandler.getUserExams
        )

        this.router.route('/:examId').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            CheckExamAccess(userExamAccessService),
            this.examHandler.getUserExamDetails
        )

        this.router.route('/:examId/courses').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            CheckExamAccess(userExamAccessService),
            this.adminExamHandler.getCoursesHandler
        )

        this.router.route('/:examId/courses/:courseId').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(courseIdSchema, "params"),
            (req: Request, res: Response, next: NextFunction) => {
                req.query.courseId = req.params.courseId
                next()
            },
            ValidationMiddleware(getCommandFilterSchema, "query"),
            CheckExamAccess(userExamAccessService),
            this.adminExamHandler.getSubjectsHandler
        )

        this.router.route('/:examId/courses/:courseId/questions').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(courseIdSchema, "params"),
            (req: Request, res: Response, next: NextFunction) => {
                req.query.courseId = req.params.courseId
                next()
            },
            ValidationMiddleware(getCommandFilterSchema, "query"),
            CheckExamAccess(userExamAccessService),
            this.adminExamHandler.getSubjectsHandler
        )

        this.router.route('/:examId/question/:questionId').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(questionIdSchema, "params"),
            CheckExamAccess(userExamAccessService),
            this.adminExamHandler.getQuestionByIdHandler
        )

        this.router.route('/:examId/free').get(
            ValidationMiddleware(userExamIdSchema, "params"),
            this.examHandler.getFreeQuestions
        )

        this.router.route("/:examId/tag").get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(paginationSchema,"query"),
            CheckExamAccess(userExamAccessService),
            this.examHandler.getTaggedQuestion
        )
        this.router.route("/:examId/report").get(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(paginationSchema,"query"),
            CheckExamAccess(userExamAccessService),
            this.examHandler.getReportQuestion

        )

        this.router.route("/:examId/:questionId/tag").post(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(questionIdSchema, "params"),
            CheckExamAccess(userExamAccessService),
            this.examHandler.tagQuestion
        )

        this.router.route("/:examId/:questionId/report").post(
            ValidationMiddleware(userExamIdSchema, "params"),
            ValidationMiddleware(questionIdSchema, "params"),
            ValidationMiddleware(z.object({reason: z.string()}), "body"),
            CheckExamAccess(userExamAccessService),
            this.examHandler.reportQuestion
        )

    }
}