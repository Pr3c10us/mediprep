import {ExamRepository} from "../../../domain/exams/repository";

export interface DeleteQuestionCommand {
    Handle: (questionId: string) => Promise<void>
}

export class DeleteQuestionCommandC implements DeleteQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(questionId: string): Promise<void> {
        try {
            const question = await this.examRepository.GetQuestionById(questionId)
            await this.examRepository.DeleteQuestion(question.id as string)
        } catch (error) {
            throw error
        }
    }

}
