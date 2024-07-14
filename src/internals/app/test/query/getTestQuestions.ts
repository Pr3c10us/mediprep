import {TestRepository} from "../../../domain/tests/repository";
import {Question} from "../../../domain/exams/exam";

export interface GetTestQuestions {
    Handle: (testId: string, userId: string) => Promise<Question[]>
}

export class GetTestQuestionsC implements GetTestQuestionsC {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string): Promise<Question[]> => {
        try {
            return await this.testRepositories.getTestQuestions(testId, userId)
        } catch (error) {
            throw error;
        }
    }

}