import {ExamRepository} from "../../../domain/exams/repository";

export interface DeleteExamCommand {
    Handle: (id: string ) => Promise<void>
}

export class DeleteExamCommandC implements DeleteExamCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(id: string): Promise<void> {
        try {
            const examResult = await this.examRepository.GetExamById(id)
            await this.examRepository.DeleteExam(examResult.id as string)
        } catch (error) {
            throw error
        }
    }

}
