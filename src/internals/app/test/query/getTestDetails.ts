import {TestRepository} from "../../../domain/tests/repository";
import {Test} from "../../../domain/tests/test";
import {Question} from "../../../domain/exams/exam";

export interface GetTestDetails {
    Handle: (testId: string, userId: string) => Promise<{ test: Test, questions: Question[] }>
}

export class GetTestDetailsC implements GetTestDetailsC {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string): Promise<{ test: Test, questions: Question[] }> => {
        try {
            return await this.testRepositories.getTestAnalytics(testId, userId)
        } catch (error) {
            throw error;
        }
    }

}