import { AdminServices } from "../../../../../app/admin/admin";
import { Request, Response } from "express";
import { ExamServices } from "../../../../../app/exam/exam";
import {
    Course,
    EditQuestionParams,
    Exam,
    ExamDiscount,
    Option,
    Question,
    Subject
} from "../../../../../domain/exams/exam";
import { SuccessResponse } from "../../../../../../pkg/responses/success";
import { BadRequestError } from "../../../../../../pkg/errors/customError";
import { PaginationFilter } from "../../../../../../pkg/types/pagination";

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
            totalMockScores: req.body.totalMockScores || 0,
            mocksTaken: req.body.mocksTaken || 0,
            mockTestTime: req.body.mockTestTime,
            subscriptionAmount: req.body.subscriptionAmount,
            mockQuestions: req.body.mockQuestions
        }

        await this.examServices.commands.addExam.Handle(exam)

        new SuccessResponse(res, { message: `exam ${req.body.name} added` }).send()
    }
    addExamDiscountHandler = async (req: Request, res: Response) => {
        const examDiscount: ExamDiscount = {
            month: req.body.month,
            type: req.body.type,
            value: req.body.value,
            examID: req.body.examId,
        }

        await this.examServices.commands.addExamDiscount.Handle(examDiscount)
        new SuccessResponse(res, { message: `discount added` }).send()
    }
    getExamsHandler = async (req: Request, res: Response) => {
        const { limit, page, name } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
        };

        const { exams, metadata } = await this.examServices.queries.getExams.handle(filter);

        new SuccessResponse(res, { exams: exams }, metadata).send();
    }
    getExamDetails = async (req: Request, res: Response) => {
        const { exam, discounts } = await this.examServices.queries.getExamDetails.handle(req.params.id);

        new SuccessResponse(res, { exam, discounts: discounts }).send();
    }
    getQuestionBatches = async (req: Request, res: Response) => {
        const filter: PaginationFilter = {
            limit: Number(req.query.limit) || 10,
            page: Number(req.query.page) || 1,
        };
        const { questionBatches, metadata } = await this.examServices.queries.getQuestionBatches.handle(filter);

        new SuccessResponse(res, { questionBatches }, metadata).send();
    }
    deleteExamHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteExam.Handle(req.params.id)

        new SuccessResponse(res, { message: `exam deleted` }).send()
    }
    editExamHandler = async (req: Request, res: Response) => {
        const exam: Exam = {
            name: req.body.name,
            description: req.body.description,
            totalMockScores: req.body.totalMockScores,
            mocksTaken: req.body.mocksTaken,
            mockTestTime: req.body.mockTestTime,
            subscriptionAmount: req.body.subscriptionAmount,
            mockQuestions: req.body.mockQuestions
        }

        if (!exam.name && !exam.description && !exam.subscriptionAmount && !exam.mockQuestions) {
            throw new BadRequestError("Provide an exam key to update")
        }

        await this.examServices.commands.editExam.Handle(req.params.id, exam)

        new SuccessResponse(res, { message: `exam updated` }).send()
    }
    uploadExamImageHandler = async (req: Request, res: Response) => {
        const file = req.file
        if (!file) throw new BadRequestError("issue uploading file")

        await this.examServices.commands.uploadExamImage.Handle(req.params.id, file)

        new SuccessResponse(res, { message: "image uploaded" }).send()
    }
    uploadImageHandler = async (req: Request, res: Response) => {
        const file = req.file
        if (!file) throw new BadRequestError("issue uploading file")

        const fileURL = await this.examServices.commands.uploadImage.Handle(file)

        new SuccessResponse(res, { url: fileURL }).send()
    }
    getReportedQuestions = async (req: Request, res: Response) => {
        const { limit, page } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            examId: req.params.id
        };

        const questionsResponse = await this.examServices.queries.getReportedQuestionsQuery.Handle(filter)
        console.log(questionsResponse);

        new SuccessResponse(res, { questions: questionsResponse.questions }, questionsResponse.metadata).send();
    }


    // Courses Handlers
    addCourseHandler = async (req: Request, res: Response) => {
        const course: Course = {
            name: req.body.name,
            examId: req.body.examId
        }

        await this.examServices.commands.addCourse.Handle(course)

        new SuccessResponse(res, { message: `course ${req.body.name} added` }).send()
    }
    getCoursesHandler = async (req: Request, res: Response) => {
        const { limit, page, name, examId } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            examId: examId as string | undefined
        };

        const { courses, metadata } = await this.examServices.queries.getCourses.handle(filter);

        new SuccessResponse(res, { courses: courses }, metadata).send();
    }
    deleteCourseHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteCourse.Handle(req.params.courseId)

        new SuccessResponse(res, { message: `course deleted` }).send()
    }
    editCourseHandler = async (req: Request, res: Response) => {
        const course: Course = {
            id: req.params.courseId,
            name: req.body.name,
        }

        await this.examServices.commands.editCourse.Handle(course)

        new SuccessResponse(res, { message: `course updated` }).send()
    }


    // Subject Handlers
    addSubjectHandler = async (req: Request, res: Response) => {
        const subject: Subject = {
            name: req.body.name,
            courseId: req.body.courseId
        }

        await this.examServices.commands.addSubject.Handle(subject)

        new SuccessResponse(res, { message: `subject ${req.body.name} added` }).send()
    }
    getSubjectsHandler = async (req: Request, res: Response) => {
        const { limit, page, name, courseId, examId } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            courseId: courseId as string | undefined,
            examId: examId as string | undefined
        };

        const { subjects, metadata } = await this.examServices.queries.getSubjects.handle(filter);

        new SuccessResponse(res, { subjects: subjects }, metadata).send();
    }
    deleteSubjectHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteSubject.Handle(req.params.subjectId)

        new SuccessResponse(res, { message: `subject deleted` }).send()
    }
    editSubjectHandler = async (req: Request, res: Response) => {
        const subject: Subject = {
            id: req.params.subjectId,
            name: req.body.name,
        }

        await this.examServices.commands.editSubject.Handle(subject)

        new SuccessResponse(res, { message: `subject updated` }).send()
    }


    // Question Handlers
    addQuestionHandler = async (req: Request, res: Response) => {
        const options: Option[] = req.body.options.map((option: Option) => {
            return option
        })
        const question: Question = {
            type: req.body.type,
            question: req.body.question,
            explanation: req.body.explanation,
            options,
            subjectId: req.body.subjectId
        }

        await this.examServices.commands.addQuestion.Handle(question)

        new SuccessResponse(res, { message: `question added to subject` }).send()
    }
    addQuestionFileHandler = async (req: Request, res: Response) => {
        const file = req.file
        if (!file) throw new BadRequestError("issue uploading file")

        await this.examServices.commands.addQuestionFile.Handle(req.params.id, file)
        new SuccessResponse(res, { message: `questions added by file upload processing` }).send()
    }
    getQuestionsHandler = async (req: Request, res: Response) => {
        const { limit, page, subjectId } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 100,
            page: Number(page) || 1,
            subjectId: subjectId as string | undefined
        };

        const { questions, metadata } = await this.examServices.queries.getQuestions.handle(filter);

        new SuccessResponse(res, { questions: questions }, metadata).send();
    }
    deleteQuestionHandler = async (req: Request, res: Response) => {
        await this.examServices.commands.deleteQuestion.Handle(req.params.questionId)
        new SuccessResponse(res, { message: `question deleted` }).send()
    }
    editQuestionHandler = async (req: Request, res: Response) => {
        const question: EditQuestionParams = {
            id: req.params.questionId,
            type: req.body.type,
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

        if (!question.question && !question.type && !question.explanation && !question.options) {
            throw new BadRequestError("Provide a question key to update")
        }

        await this.examServices.commands.editQuestion.Handle(question)

        new SuccessResponse(res, { message: `question updated` }).send()
    }
    getQuestionByIdHandler = async (req: Request, res: Response) => {
        const question = await this.examServices.queries.getQuestionById.handle(req.params.questionId)
        new SuccessResponse(res, { question }).send()
    }
}