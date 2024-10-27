import { Request, Response } from "express";
import { ExamServices } from "../../../../../app/exam/exam";
import { SuccessResponse } from "../../../../../../pkg/responses/success";
import { PaginationFilter } from "../../../../../../pkg/types/pagination";
import { UserExamAccessService } from "../../../../../app/examAccess/examAccess";

export class ExamHandler {
    examServices: ExamServices;
    userExamAccessService: UserExamAccessService

    constructor(examServices: ExamServices, userExamAccessService: UserExamAccessService) {
        this.examServices = examServices;
        this.userExamAccessService = userExamAccessService
    }

    getFreeQuestions = async (req: Request, res: Response) => {
        const filter: PaginationFilter = {
            limit: 20,
            page: 1,
            // free: true,
            random: false,
            examId: req.params.examId
        };

        const { questions, metadata } = await this.examServices.queries.getQuestions.handle(filter);

        new SuccessResponse(res, { questions }, metadata).send();
    }

    getUserExams = async (req: Request, res: Response) => {
        const { limit, page, name } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            userId: req.userD?.id
        };

        const { exams, metadata } = await this.userExamAccessService.queries.getUserExams.handle(filter)

        new SuccessResponse(res, { exams: exams }, metadata).send();
    }

    getUserExamDetails = async (req: Request, res: Response) => {
        const {
            exam,
            metadata
        } = await this.examServices.queries.getExamAnalytics.handle(req.userD?.id as string, req.params.examId)
        new SuccessResponse(res, { exam }, metadata).send();
    }

    getExamDetails = async (req: Request, res: Response) => {
        const { exam, discounts } = await this.examServices.queries.getExamDetails.handle(req.params.examId);

        new SuccessResponse(res, { exam, discounts: discounts }).send();
    }

    tagQuestion = async (req: Request, res: Response) => {
        await this.examServices.commands.tagQuestion.Handle(req.userD?.id as string, req.params.questionId)
        new SuccessResponse(res, { message: "question Tagged" }).send();
    }

    reportQuestion = async (req: Request, res: Response) => {
        await this.examServices.commands.reportQuestion.Handle(req.userD?.id as string, req.params.questionId, req.body.reason)
        new SuccessResponse(res, { message: "question reported" }).send();
    }

    getReportQuestion = async (req: Request, res: Response) => {
        const filter: PaginationFilter = {
            userId: req.userD?.id,
            examId: req.params.examId,
            limit: Number(req.query.limit) || 10,
            page: Number(req.query.page) || 1,
        }
        const questionsResponse = await this.examServices.queries.getReportedQuestionsQuery.Handle(filter)
        new SuccessResponse(res, { questions: questionsResponse.questions }, questionsResponse.metadata).send();
    }

    getTaggedQuestion = async (req: Request, res: Response) => {
        const filter: PaginationFilter = {
            userId: req.userD?.id,
            examId: req.params.examId,
            limit: Number(req.query.limit) || 10,
            page: Number(req.query.page) || 1,
        }
        const questionsResponse = await this.examServices.queries.getTaggedQuestionsQuery.handle(filter)
        new SuccessResponse(res, { questions: questionsResponse.questions }, questionsResponse.metadata).send();
    }

    getQuestionByIdHandler = async (req: Request, res: Response) => {
        const question = await this.examServices.queries.getQuestionById.handle(req.params.questionId)
        new SuccessResponse(res, { question }).send()
    }
}