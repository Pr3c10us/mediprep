import {TestRepository} from "../../../domain/tests/repository";

export interface PauseTest {
    Handle: (testId: string, userId: string) => Promise<void>
}

export class PauseTestC implements PauseTest {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string): Promise<void> => {
        try {
            await this.testRepositories.pauseTestStatus(testId, userId)
        } catch (error) {
            throw error;
        }
    }

}