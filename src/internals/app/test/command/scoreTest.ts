import {UserAnswer} from "../../../domain/tests/test";
import {TestRepository} from "../../../domain/tests/repository";

export interface ScoreTest {
    Handle: (testId: string, userId: string, answers: UserAnswer[]) => Promise<string>
}

export class ScoreTestC implements ScoreTest {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (testId: string, userId: string, answers: UserAnswer[]): Promise<string> => {
        try {
            return await this.testRepositories.scoreTest(testId, userId, answers)
        } catch (error) {
            throw error;
        }
    }

}