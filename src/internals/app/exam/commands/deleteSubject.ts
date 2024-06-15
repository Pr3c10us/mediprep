import {ExamRepository} from "../../../domain/exams/repository";

export interface DeleteSubjectCommand {
    Handle: (subjectId: string) => Promise<void>
}

export class DeleteSubjectCommandC implements DeleteSubjectCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(subjectId: string): Promise<void> {
        try {
            const subject = await this.examRepository.GetSubjectById(subjectId)
            await this.examRepository.DeleteSubject(subject.id as string)
        } catch (error) {
            throw error
        }
    }

}
