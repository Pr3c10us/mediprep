import {Question} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddQuestionCommand {
    Handle: (question: Question) => Promise<void>
}

export class AddQuestionCommandC implements AddQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(question: Question): Promise<void> {
        try {
            await this.examRepository.AddQuestion(question)
        } catch (error) {
            throw error
        }
    }

}