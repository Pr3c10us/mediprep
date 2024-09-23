import { TestRepository } from "../../../domain/tests/repository";
import { CacheRepository } from "../../../domain/cache/repository";

export interface ResumeTest {
    Handle: (
        testIde: string,
        userId: string
    ) => Promise<{ testID: string; remainingTime: number }>;
}

export class ResumeTestC implements ResumeTest {
    testRepositories: TestRepository;
    cacheRepository: CacheRepository;

    constructor(
        testRepositories: TestRepository,
        cacheRepository: CacheRepository
    ) {
        this.testRepositories = testRepositories;
        this.cacheRepository = cacheRepository;
    }

    Handle = async (
        testIde: string,
        userId: string
    ): Promise<{ testID: string; remainingTime: number }> => {
        try {
            const { testId, timeLeft } =
                await this.testRepositories.resumeTestStatus(testIde, userId);
            await this.cacheRepository.Set(
                testId,
                testId,
                Math.round(timeLeft)
            );
            return { testID: testId, remainingTime: Math.round(timeLeft) };
        } catch (error) {
            throw error;
        }
    };
}
