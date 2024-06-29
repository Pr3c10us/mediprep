import {Subject} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddSubjectCommand {
    Handle: (subject: Subject) => Promise<Subject>
}

export class AddSubjectCommandC implements AddSubjectCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(subject: Subject): Promise<Subject> {
        try {
            return await this.examRepository.AddSubject(subject)
        } catch (error) {
            throw error
        }
    }

}