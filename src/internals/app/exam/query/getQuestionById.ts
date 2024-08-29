import {Question} from "../../../domain/exams/exam";
import {ExamRepository} from "../../../domain/exams/repository";

export interface GetQuestionByIdQuery {
    handle: (questionId: string) => Promise<Question>
}

export class GetQuestionByIdQueryC implements GetQuestionByIdQuery {
    examRepository: ExamRepository;

    constructor(examRepository: ExamRepository) {
        this.examRepository = examRepository;
    }

    handle = async (questionId: string): Promise<Question> => {
        try {
            return await this.examRepository.GetQuestionById(
                questionId
            )

        } catch (error) {
            throw error
        }
    };
}
