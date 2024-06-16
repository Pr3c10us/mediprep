import {Subject} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface EditSubjectCommand {
    Handle: (subject: Subject) => Promise<void>
}

export class EditSubjectCommandC implements EditSubjectCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(subject: Subject): Promise<void> {
        try {
            await this.examRepository.EditSubjectName(subject.id as string,subject.name)
        } catch (error) {
            throw error
        }
    }

}