import {Exam} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetExamsDetails {
    handle: (examId:string) => Promise<{ exam: Exam }>
}

export class GetExamsDetailsC implements GetExamsDetails {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository ) {
        this.examRepository = examRepository;
    }

    handle = async (examId:string): Promise<{ exam: Exam }> => {
        try {
            const exam = await this.examRepository.GetExamAnalytics(examId);
            return {exam};

        } catch (error) {
            throw error
        }
    };
}
