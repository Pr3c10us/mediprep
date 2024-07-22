import {ExamRepository} from "../../../domain/exams/repository";

export interface TagQuestionCommand {
    Handle: (userId: string, questionId: string) => Promise<void>
}

export class TagQuestionCommandC implements TagQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(userId: string, questionId: string): Promise<void> {
        try {
            await this.examRepository.TagQuestion(userId, questionId)
        } catch (error) {
            throw error
        }
    }
}
