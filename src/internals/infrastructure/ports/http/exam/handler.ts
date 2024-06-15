import {AdminServices} from "../../../../app/admin/admin";
import {Request, Response, Router} from "express";
import {ExamServices} from "../../../../app/exam/exam";
import AuthorizeAdmin from "../../../../../pkg/middleware/authorization";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import ValidationMiddleware from "../../../../../pkg/middleware/validation";
import {Multer} from 'multer';
import {
    addExamSchema,
    courseIdSchema,
    courseSchema,
    editCourseSchema,
    editExamSchema,
    editSubjectSchema,
    examIdSchema,
    getCommandFilterSchema,
    subjectIdSchema,
    subjectSchema
} from "../../../../../pkg/validations/exam";
import {Course, Exam, Subject} from "../../../../domain/exams/exam";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import {BadRequestError} from "../../../../../pkg/errors/customError";
import {MulterConfig} from "../../../../../pkg/utils/multer";
import {PaginationFilter} from "../../../../../pkg/types/pagination";

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

        // Exams Route
        this.router.route('/').post(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("create_exam"),
            ValidationMiddleware(addExamSchema, "body"),
            this.addExamHandler
        ).get(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getExamsHandler
        )
        this.router.route('/:id').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(editExamSchema, "body"),
            ValidationMiddleware(examIdSchema, "params"),
            this.editExamHandler
        ).delete(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("delete_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.deleteExamHandler
        )
        this.router.route('/:id/image').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.upload.single("image"),
            this.uploadExamImageHandler
        )

        // Courses Route
        this.router.route('/course').post(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseSchema, "body"),
            this.addCourseHandler
        ).get(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getCoursesHandler
        )
        this.router.route('/course/:courseId').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(editCourseSchema, "body"),
            ValidationMiddleware(courseIdSchema, "params"),
            this.editCourseHandler
        ).delete(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseIdSchema, "params"),
            this.deleteCourseHandler
        )

        // Subject Route
        this.router.route('/subject').post(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectSchema, "body"),
            this.addSubjectHandler
        ).get(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getSubjectsHandler
        )
        this.router.route('/subject/:subjectId').patch(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(editSubjectSchema, "body"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.editSubjectHandler
        ).delete(
            AuthorizeAdmin(this.adminServices.adminRepository),
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.deleteSubjectHandler
        )

    }

    // Exams Handlers
    addExamHandler = async (req: Request, res: Response) => {
        const exam: Exam = {
            name: req.body.name,
            description: req.body.description
        }

        await this.examServices.commands.addExam.Handle(exam)

        new SuccessResponse(res, {message: `exam ${req.body.name} added`}).send()
    }
    getExamsHandler = async (req: Request, res: Response) => {
        const {limit, page, name} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
        };

        const {exams, metadata} = await this.examServices.queries.getExams.handle(filter);

        new SuccessResponse(res, {exams: exams}, metadata).send();
    }
    deleteExamHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteExam.Handle(req.params.id)

        new SuccessResponse(res, {message: `exam deleted`}).send()
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

        new SuccessResponse(res, {message: "image uploaded"}).send()
    }

    // Courses Handlers
    addCourseHandler = async (req: Request, res: Response) => {
        const course: Course = {
            name: req.body.name,
            examId: req.body.examId
        }

        await this.examServices.commands.addCourse.Handle(course)

        new SuccessResponse(res, {message: `course ${req.body.name} added`}).send()
    }
    getCoursesHandler = async (req: Request, res: Response) => {
        const {limit, page, name} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
        };

        const {courses, metadata} = await this.examServices.queries.getCourses.handle(filter);

        new SuccessResponse(res, {courses: courses}, metadata).send();
    }
    deleteCourseHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteCourse.Handle(req.params.courseId)

        new SuccessResponse(res, {message: `course deleted`}).send()
    }
    editCourseHandler = async (req: Request, res: Response) => {
        const course: Course = {
            id: req.params.courseId,
            name: req.body.name,
        }

        await this.examServices.commands.editCourse.Handle(course)

        new SuccessResponse(res, {message: `course updated`}).send()
    }

    addSubjectHandler = async (req: Request, res: Response) => {
        const subject: Subject = {
            name: req.body.name,
            courseId: req.body.courseId
        }

        await this.examServices.commands.addSubject.Handle(subject)

        new SuccessResponse(res, {message: `subject ${req.body.name} added`}).send()
    }
    getSubjectsHandler = async (req: Request, res: Response) => {
        const {limit, page, name} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
        };

        const {subjects, metadata} = await this.examServices.queries.getSubjects.handle(filter);

        new SuccessResponse(res, {subjects: subjects}, metadata).send();
    }
    deleteSubjectHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteSubject.Handle(req.params.subjectId)

        new SuccessResponse(res, {message: `subject deleted`}).send()
    }
    editSubjectHandler = async (req: Request, res: Response) => {
        const subject: Subject = {
            id: req.params.subjectId,
            name: req.body.name,
        }

        await this.examServices.commands.editSubject.Handle(subject)

        new SuccessResponse(res, {message: `subject updated`}).send()
    }
}