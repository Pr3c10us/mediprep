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
            await this.examRepository.EditExam(id as string,exam)
        } catch (error) {
            throw error
        }
    }

}
