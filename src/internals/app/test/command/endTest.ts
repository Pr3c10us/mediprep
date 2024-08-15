import {TestRepository} from "../../../domain/tests/repository";

export interface EndTest {
    Handle: (testId: string, userId: string) => Promise<void>
}

export class EndTestC implements EndTest {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string): Promise<void> => {
        try {
            await this.testRepositories.endTest(testId, userId)
        } catch (error) {
            throw error;
        }
    }

}