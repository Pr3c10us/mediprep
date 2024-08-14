import {ExamDiscount} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface AddExamDiscountCommand {
    Handle: (discount: ExamDiscount) => Promise<void>
}

export class AddExamDiscountCommandC implements AddExamDiscountCommand {
    examRepository: ExamRepository

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository
    }

    async Handle(discount: ExamDiscount): Promise<void> {
        try {
            await this.examRepository.AddExamDiscount(discount)
        } catch (error) {
            throw error
        }
    }

}
