import {Exam, ExamDiscount} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetExamsDetails {
    handle: (examId:string) => Promise<{ exam: Exam ,discounts: ExamDiscount[]}>
}

export class GetExamsDetailsC implements GetExamsDetails {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository ) {
        this.examRepository = examRepository;
    }

    handle = async (examId:string): Promise<{ exam: Exam ,discounts: ExamDiscount[]}> => {
        try {
            const exam = await this.examRepository.GetExamAnalytics(examId);
            const discounts = await this.examRepository.GetExamDiscounts(examId)
            return {exam, discounts: discounts};
        } catch (error) {
            throw error
        }
    };
}
