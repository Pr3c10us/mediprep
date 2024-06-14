import {Exam} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddExamCommand {
    Handle: (exam: Exam) => Promise<void>
}

export class AddExamCommandC implements AddExamCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(exam: Exam): Promise<void> {
        try {
            await this.examRepository.AddExam(exam)
        } catch (error) {
            throw error
        }
    }

}
