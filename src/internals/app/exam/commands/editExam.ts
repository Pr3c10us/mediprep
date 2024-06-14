import {Exam} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface EditExamCommand {
    Handle: (id: string ,exam: Exam) => Promise<void>
}

export class EditExamCommandC implements EditExamCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(id: string ,exam: Exam): Promise<void> {
        try {
            const examResult = await this.examRepository.GetExamById(id)
            await this.examRepository.EditExam(examResult.id as string,exam)
        } catch (error) {
            throw error
        }
    }

}
