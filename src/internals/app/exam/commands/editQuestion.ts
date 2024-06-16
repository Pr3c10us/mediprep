import {EditQuestionParams} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface EditQuestionCommand {
    Handle: (question: EditQuestionParams) => Promise<void>
}

export class EditQuestionCommandC implements EditQuestionCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(question: EditQuestionParams): Promise<void> {
        try {
            await this.examRepository.EditQuestion(question)
        } catch (error) {
            throw error
        }
    }

}
