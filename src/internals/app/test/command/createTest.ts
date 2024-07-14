import {Test} from "../../../domain/tests/test";
import {TestRepository} from "../../../domain/tests/repository";

export interface CreateTest {
    Handle: (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">) => Promise<string>
}

export class CreateTestC implements CreateTestC {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">): Promise<string> => {
        try {
            return await this.testRepositories.CreateTest(test)
        } catch (error) {
            throw error;
        }
    }

}