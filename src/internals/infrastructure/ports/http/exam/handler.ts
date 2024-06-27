import {AdminServices} from "../../../../app/admin/admin";
import {Request, Response, Router} from "express";
import {ExamServices} from "../../../../app/exam/exam";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import ValidationMiddleware from "../../../../../pkg/middleware/validation";
import {Multer} from 'multer';
import {
    addExamSchema,
    courseIdSchema,
    courseSchema,
    editCourseSchema,
    editExamSchema,
    editQuestionSchema,
    editSubjectSchema,
    examIdSchema,
    getCommandFilterSchema, questionIdSchema,
    questionSchema,
    subjectIdSchema,
    subjectSchema
} from "../../../../../pkg/validations/exam";
import {Course, EditQuestionParams, Exam, Option, Question, Subject} from "../../../../domain/exams/exam";
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
            CheckPermission("create_exam"),
            ValidationMiddleware(addExamSchema, "body"),
            this.addExamHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getExamsHandler
        )
        this.router.route('/:id').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editExamSchema, "body"),
            ValidationMiddleware(examIdSchema, "params"),
            this.editExamHandler
        ).delete(
            CheckPermission("delete_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.deleteExamHandler
        )
        this.router.route('/:id/image').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.upload.single("image"),
            this.uploadExamImageHandler
        )


        // Courses Route
        this.router.route('/course').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseSchema, "body"),
            this.addCourseHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getCoursesHandler
        )
        this.router.route('/course/:courseId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseIdSchema, "params"),
            ValidationMiddleware(editCourseSchema, "body"),
            this.editCourseHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseIdSchema, "params"),
            this.deleteCourseHandler
        )


        // Subject Route
        this.router.route('/subject').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectSchema, "body"),
            this.addSubjectHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getSubjectsHandler
        )
        this.router.route('/subject/:subjectId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editSubjectSchema, "body"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.editSubjectHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.deleteSubjectHandler
        )


        // Subject Route
        this.router.route('/question').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(questionSchema, "body"),
            this.addQuestionHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.getQuestionsHandler
        )

        this.router.route('/question/:questionId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editQuestionSchema, "body"),
            ValidationMiddleware(questionIdSchema, "params"),
            this.editQuestionHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(questionIdSchema, "params"),
            this.deleteQuestionHandler
        )
    }

    // Exams Handlers
    addExamHandler = async (req: Request, res: Response) => {
        const exam: Exam = {
            name: req.body.name,
            description: req.body.description,
            subscriptionAmount: req.body.subscriptionAmount
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
            description: req.body.description,
            subscriptionAmount: req.body.subscriptionAmount
        }

        if (!exam.name && !exam.description && !exam.subscriptionAmount) {
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


    // Subject Handlers
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


    // Question Handlers
    addQuestionHandler = async (req: Request, res: Response) => {
        const options: Option[] = req.body.options.map((option: Option) => {
            return option
        })
        const question: Question = {
            description: req.body.description,
            question: req.body.question,
            explanation: req.body.explanation,
            options,
            subjectId: req.body.subjectId
        }

        await this.examServices.commands.addQuestion.Handle(question)

        new SuccessResponse(res, {message: `question added to subject`}).send()
    }
    getQuestionsHandler = async (req: Request, res: Response) => {
        const {limit, page, subjectId} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 100,
            page: Number(page) || 1,
            subjectId: subjectId as string | undefined
        };

        const {questions, metadata} = await this.examServices.queries.getQuestions.handle(filter);

        new SuccessResponse(res, {questions: questions}, metadata).send();
    }
    deleteQuestionHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteQuestion.Handle(req.params.questionId)
        new SuccessResponse(res, {message: `question deleted`}).send()
    }
    editQuestionHandler = async (req: Request, res: Response) => {
        const question: EditQuestionParams = {
            id: req.params.questionId,
            description: req.body.description,
            question: req.body.question,
            explanation: req.body.explanation,
            options: (req.body.options && req.body.options.length > 0) ? req.body.options.map((option: any) => {
                return {
                    index: option.index,
                    value: option.value,
                    answer: option.answer,
                    explanation: option.explanation
                }
            }) : undefined,
        }

        if (!question.question && !question.description && !question.explanation && !question.options) {
            throw new BadRequestError("Provide a question key to update")
        }

        await this.examServices.commands.editQuestion.Handle(question)

        new SuccessResponse(res, {message: `question updated`}).send()
    }
}