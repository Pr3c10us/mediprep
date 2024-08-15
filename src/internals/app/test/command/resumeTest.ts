import {TestRepository} from "../../../domain/tests/repository";
import {CacheRepository} from "../../../domain/cache/repository";

export interface ResumeTest {
    Handle: (testIde: string, userId: string) => Promise<string>
}

export class ResumeTestC implements ResumeTest {
    testRepositories: TestRepository
    cacheRepository: CacheRepository


    constructor(testRepositories: TestRepository,    cacheRepository: CacheRepository
    ) {
        this.testRepositories = testRepositories
        this.cacheRepository = cacheRepository
    }

    Handle = async (testIde: string, userId: string): Promise<string> => {
        try {
            const {testId, timeLeft} = await this.testRepositories.resumeTestStatus(testIde, userId)
            await this.cacheRepository.Set(testId, testId, Math.round(timeLeft))
            return testId
        } catch (error) {
            throw error;
        }
    }

}