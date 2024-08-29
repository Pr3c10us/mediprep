import {ExamServices} from "../../../../../app/exam/exam";
import {AdminServices} from "../../../../../app/admin/admin";
import {Router} from "express";
import {MulterConfig} from "../../../../../../pkg/utils/multer";
import {ExamHandler} from "./handler";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {Multer} from 'multer';
import {
    addExamDiscountSchema,
    addExamSchema,
    courseIdSchema,
    courseSchema,
    editCourseSchema,
    editExamSchema,
    editQuestionSchema,
    editSubjectSchema,
    examIdSchema,
    getCommandFilterSchema, paginationSchema,
    questionIdSchema,
    questionSchema,
    subjectIdSchema,
    subjectSchema
} from "../../../../../../pkg/validations/exam";

export class ExamRouter {
    router: Router;
    handler: ExamHandler
    uploadImage: Multer
    uploadCSV: Multer

    constructor(examServices: ExamServices, adminServices: AdminServices) {
        this.router = Router();
        this.handler = new ExamHandler(examServices, adminServices)
        this.uploadImage = new MulterConfig().multer
        this.uploadCSV = new MulterConfig("tabularDocument", 1024 * 1024 * 1024).multer


        this.router.route('/upload/image').post(
            CheckPermission("create_exam"),
            this.uploadImage.single("image"),
            this.handler.uploadImageHandler
        )

        this.router.route('/upload/exam').get(
            CheckPermission("read_exam"),
            ValidationMiddleware(paginationSchema, "query"),
            this.handler.getQuestionBatches
        )

        // Exams Route
        this.router.route('/').post(
            CheckPermission("create_exam"),
            ValidationMiddleware(addExamSchema, "body"),
            this.handler.addExamHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.handler.getExamsHandler
        )
        this.router.route('/discount').post(
            CheckPermission("create_exam"),
            ValidationMiddleware(addExamDiscountSchema, "body"),
            this.handler.addExamDiscountHandler
        )





        // Courses Route
        this.router.route('/course').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseSchema, "body"),
            this.handler.addCourseHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.handler.getCoursesHandler
        )
        this.router.route('/course/:courseId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseIdSchema, "params"),
            ValidationMiddleware(editCourseSchema, "body"),
            this.handler.editCourseHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(courseIdSchema, "params"),
            this.handler.deleteCourseHandler
        )


        // Subject Route
        this.router.route('/subject').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectSchema, "body"),
            this.handler.addSubjectHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.handler.getSubjectsHandler
        )
        this.router.route('/subject/:subjectId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editSubjectSchema, "body"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.handler.editSubjectHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(subjectIdSchema, "params"),
            this.handler.deleteSubjectHandler
        )


        // Question Route
        this.router.route('/question').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(questionSchema, "body"),
            this.handler.addQuestionHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(getCommandFilterSchema, "query"),
            this.handler.getQuestionsHandler
        )

        this.router.route('/question/:questionId').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editQuestionSchema, "body"),
            ValidationMiddleware(questionIdSchema, "params"),
            this.handler.editQuestionHandler
        ).delete(
            CheckPermission("edit_exam"),
            ValidationMiddleware(questionIdSchema, "params"),
            this.handler.deleteQuestionHandler
        ).get(
            CheckPermission("read_exam"),
            ValidationMiddleware(questionIdSchema, "params"),
            this.handler.getQuestionByIdHandler
        )


        // Exam Route
        this.router.route('/:id').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(editExamSchema, "body"),
            ValidationMiddleware(examIdSchema, "params"),
            this.handler.editExamHandler
        ).delete(
            CheckPermission("delete_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.handler.deleteExamHandler
        ).get(
            CheckPermission("read_exam"),
            this.handler.getExamDetails
        )
        this.router.route('/:id/image').patch(
            CheckPermission("edit_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.uploadImage.single("image"),
            this.handler.uploadExamImageHandler
        )

        this.router.route('/:id/question').post(
            CheckPermission("edit_exam"),
            ValidationMiddleware(examIdSchema, "params"),
            this.uploadCSV.single("csv"),
            this.handler.addQuestionFileHandler
        )
    }
}