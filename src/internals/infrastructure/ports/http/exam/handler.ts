import {AdminServices} from "../../../../app/admin/admin";
import {Request, Response, Router} from "express";
import {ExamServices} from "../../../../app/exam/exam";
import AuthorizeAdmin from "../../../../../pkg/middleware/authorization";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import ValidationMiddleware from "../../../../../pkg/middleware/validation";
import {Multer} from 'multer';

import {addExamSchema, editExamSchema, examIdSchema} from "../../../../../pkg/validations/exam";
import {Exam} from "../../../../domain/exams/exam";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import {BadRequestError} from "../../../../../pkg/errors/customError";
import {MulterConfig} from "../../../../../pkg/utils/multer";

export class ExamHandler {
    examServices: ExamServices;
    adminServices: AdminServices
    router: Router;
    upload: Multer

    constructor(examServices: ExamServices, adminServices: AdminServices) {
        this.examServices = examServices;
        this.adminServices = adminServices
        this.router = Router();
        this.upload = new MulterConfig().multer

        this.router.route('/').post(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("create_exam"),
            ValidationMiddleware(addExamSchema, "body"),
            this.addExamHandler
        )

        this.router.route('/:id').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("update_exam"),
            ValidationMiddleware(editExamSchema, "body"),
            ValidationMiddleware(examIdSchema, "params"),
            this.editExamHandler
        )

        this.router.route('/:id/image').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("update_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.upload.single("image"),
            this.uploadExamImageHandler
        )
    }

    addExamHandler = async (req: Request, res: Response) => {
        const exam: Exam = {
            name: req.body.name,
            description: req.body.description
        }

        await this.examServices.commands.addExam.Handle(exam)

        new SuccessResponse(res, {message: `exam ${req.body.name} added`}).send()
    }

    editExamHandler = async (req: Request, res: Response) => {
        const exam: Exam = {
            name: req.body.name,
            description: req.body.description
        }

        if (!exam.name && !exam.description) {
            throw new BadRequestError("Provide an exam key to update")
        }

        await this.examServices.commands.editExam.Handle(req.params.id, exam)

        new SuccessResponse(res, {message: `exam ${req.body.name} updated`}).send()
    }

    uploadExamImageHandler = async (req: Request, res: Response) => {
        const file = req.file
        if (!file) throw new BadRequestError("issue uploading file")

        await this.examServices.commands.uploadExamImage.Handle(req.params.id, file)

        new SuccessResponse(res,{message: "image uploaded"}).send()
    }
}