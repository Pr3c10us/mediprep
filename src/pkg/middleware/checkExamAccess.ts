import {Handler, NextFunction, Request, Response} from "express";
import {UserExamAccessService} from "../../internals/app/examAccess/examAccess";
import {BadRequestError} from "../errors/customError";

export const CheckExamAccess = (userExamAccessService: UserExamAccessService): Handler => {
    return async (req: Request, res: Response, next: NextFunction) => {
       try {
           if (!req.params.examId || !req.userD?.id) {
               throw new BadRequestError("Provide exam id")
           }
           req.userExamAccess = await userExamAccessService.queries.getUseExamDetails.handle(req.userD?.id, req.params.examId)
           req.query.examId = req.userExamAccess.exam.id
           next()
       } catch (error) {
           throw error
       }
    }
}