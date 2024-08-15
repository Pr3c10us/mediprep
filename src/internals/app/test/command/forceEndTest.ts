import {TestRepository} from "../../../domain/tests/repository";

export interface ForceEndTest {
    Handle: (testId: string) => Promise<void>
}

export class ForceEndTestC implements ForceEndTest {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string): Promise<void> => {
        try {
            await this.testRepositories.forceEndTest(testId)
        } catch (error) {
            throw error;
        }
    }

}