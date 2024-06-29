import {AdminServices} from "../../../../app/admin/admin";
import {Request, Response} from "express";
import {ExamServices} from "../../../../app/exam/exam";
import {Course, EditQuestionParams, Exam, Option, Question, Subject} from "../../../../domain/exams/exam";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import {BadRequestError} from "../../../../../pkg/errors/customError";
import {PaginationFilter} from "../../../../../pkg/types/pagination";

export class ExamHandler {
    examServices: ExamServices;
    adminServices: AdminServices

    constructor(examServices: ExamServices, adminServices: AdminServices) {
        this.examServices = examServices;
        this.adminServices = adminServices
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
    addQuestionFileHandler = async (req: Request, res: Response) => {
        const file = req.file
        if (!file) throw new BadRequestError("issue uploading file")

        await this.examServices.commands.addQuestionFile.Handle(req.params.id,file)
        new SuccessResponse(res, {message: `questions added by file upload processing`}).send()
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