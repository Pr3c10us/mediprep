import {Test} from "../../../domain/tests/test";
import {TestRepository} from "../../../domain/tests/repository";
import {CacheRepository} from "../../../domain/cache/repository";
import {BadRequestError} from "../../../../pkg/errors/customError";

export interface CreateTest {
    Handle: (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">) => Promise<string>
}

export class CreateTestC implements CreateTestC {
    testRepositories: TestRepository
    cacheRepository: CacheRepository

    constructor(testRepositories: TestRepository, cacheRepository: CacheRepository) {
        this.testRepositories = testRepositories
        this.cacheRepository = cacheRepository
    }

    Handle = async (test: PartialWithRequired<Test, "questions" | "questionMode" | "userId" | "examId" | "endTime" | "type">): Promise<string> => {
        try {
            const expiry = (test.endTime.getTime() - new Date().getTime()) / 1000
            if (test.type != "mock" && expiry < 300) {
                throw new BadRequestError('min time is 5 minutes')
            }
            console.log(test.endTime, new Date())
            const {testId, endTime} = await this.testRepositories.CreateTest(test)
            const newExpiry = (endTime.getTime() - new Date().getTime()) / 1000
            await this.cacheRepository.Set(testId, testId, Math.round(newExpiry))
            return testId
        } catch (error) {
            throw error;
        }
    }

}