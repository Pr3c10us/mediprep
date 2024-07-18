import {Exam} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";
import {TestRepository} from "../../../domain/tests/repository";
import {TestAnalytics} from "../../../domain/tests/test";

export interface GetExamsAnalytics {
    handle: (userId:string,examId:string) => Promise<{ exam: Exam, metadata: TestAnalytics }>
}

export class GetExamsAnalyticsC implements GetExamsAnalytics {
    examRepository: ExamRepository;
    testRepository: TestRepository;

    constructor(examRepository: ExamRepository, testRepository: TestRepository) {
        this.examRepository = examRepository;
        this.testRepository = testRepository
    }

    handle = async (userId:string,examId:string): Promise<{ exam: Exam, metadata: TestAnalytics }> => {
        try {
            const exam = await this.examRepository.GetExamById(examId);
            const testAnalytics = await this.testRepository.getExamTestAnalytics(userId,examId)
            return {exam,metadata:testAnalytics};

        } catch (error) {
            throw error
        }
    };
}
