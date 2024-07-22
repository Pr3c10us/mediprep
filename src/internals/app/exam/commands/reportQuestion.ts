import {ExamRepository} from "../../../domain/exams/repository";

export interface ReportQuestionCommand {
    Handle: (userId: string, questionId: string, reason: string) => Promise<void>
}

export class ReportQuestionCommandC implements ReportQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(userId: string, questionId: string, reason: string): Promise<void> {
        try {
            await this.examRepository.ReportQuestion(userId, questionId, reason)
        } catch (error) {
            throw error
        }
    }
}
