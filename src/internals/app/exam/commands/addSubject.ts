import {Subject} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddSubjectCommand {
    Handle: (subject: Subject) => Promise<void>
}

export class AddSubjectCommandC implements AddSubjectCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(subject: Subject): Promise<void> {
        try {
            await this.examRepository.AddSubject(subject.courseId as string,subject)
        } catch (error) {
            throw error
        }
    }

}