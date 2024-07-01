import {ExamServices} from "../../../../../app/exam/exam";
import {AdminServices} from "../../../../../app/admin/admin";
import {Router} from "express";
import {ExamHandler as AdminExamHAndler} from "../../admin/exam/handler";
import {ExamHandler} from "./handler";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {examIdSchema} from "../../../../../../pkg/validations/exam";
import {UserExamAccessService} from "../../../../../app/examAccess/examAccess";

export class ExamRouter {
    router: Router;
    adminExamHandler: AdminExamHAndler
    examHandler: ExamHandler

    constructor(examServices: ExamServices, adminServices: AdminServices,userExamAccessService: UserExamAccessService) {
        this.router = Router();
        this.adminExamHandler = new AdminExamHAndler(examServices, adminServices)
        this.examHandler = new ExamHandler(examServices,userExamAccessService)

        this.router.route('/').get(
            this.adminExamHandler.getExamsHandler
        )

        this.router.route('/paid').get(
            this.examHandler.getUserExams
        )

        this.router.route('/:id').get(
            ValidationMiddleware(examIdSchema, "params"),
            this.examHandler.getUserExamDetails
        )

        this.router.route('/:id/free').get(
            ValidationMiddleware(examIdSchema, "params"),
            this.examHandler.getFreeQuestions
        )
    }
}