import {Request, Response} from "express";
import {ExamServices} from "../../../../../app/exam/exam";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";
import {UserExamAccessService} from "../../../../../app/examAccess/examAccess";

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
            free: true,
            random: true,
            examId: req.params.examId
        };

        const {questions, metadata} = await this.examServices.queries.getQuestions.handle(filter);

        new SuccessResponse(res, {questions}, metadata).send();
    }

    getUserExams = async (req: Request, res: Response) => {
        const {limit, page, name} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            userId: req.user?.id
        };

        const {exams, metadata} = await this.userExamAccessService.queries.getUserExams.handle(filter)

        new SuccessResponse(res, {exams: exams}, metadata).send();
    }

    getUserExamDetails = async (req: Request, res: Response) => {
        new SuccessResponse(res, {exam: req.userExamAccess?.exam}, req.userExamAccess?.metadata).send();
    }


}