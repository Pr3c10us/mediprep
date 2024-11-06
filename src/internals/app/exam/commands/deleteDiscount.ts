import {ExamRepository} from "../../../domain/exams/repository";

export interface DeleteDiscountCommand {
    Handle: (subjectId: string) => Promise<void>
}

export class DeleteDiscountCommandC implements DeleteDiscountCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(discountID: string): Promise<void> {
        try {
            await this.examRepository.DeleteDiscount(discountID)
        } catch (error) {
            throw error
        }
    }

}