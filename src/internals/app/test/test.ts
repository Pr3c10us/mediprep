import {TestRepository} from "../../domain/tests/repository";
import {CreateTest, CreateTestC} from "./command/createTest";
import {ScoreTest, ScoreTestC} from "./command/scoreTest";
import {GetTestQuestions, GetTestQuestionsC} from "./query/getTestQuestions";
import {GetTests, GetTestsC} from "./query/getTests";
import {GetTestDetails, GetTestDetailsC} from "./query/getTestDetails";
import {CacheRepository} from "../../domain/cache/repository";
import {EndTest, EndTestC} from "./command/endTest";
import {ForceEndTest, ForceEndTestC} from "./command/forceEndTest";
import {PauseTest, PauseTestC} from "./command/pauseTest";
import {ResumeTest, ResumeTestC} from "./command/resumeTest";

export class Commands {
    createTest: CreateTest
    scoreTest: ScoreTest
    endTest: EndTest
    forceEndTest: ForceEndTest
    pauseTest: PauseTest
    resumeTest: ResumeTest


    constructor(testRepository: TestRepository, cacheRepository: CacheRepository) {
        this.createTest = new CreateTestC(testRepository, cacheRepository)
        this.scoreTest = new ScoreTestC(testRepository)
        this.endTest = new EndTestC(testRepository)
        this.forceEndTest = new ForceEndTestC(testRepository)
        this.pauseTest = new PauseTestC(testRepository)
        this.resumeTest = new ResumeTestC(testRepository, cacheRepository)
    }
}

export class Queries {
    getTestQuestions: GetTestQuestions
    getTests: GetTests
    getTestDetails: GetTestDetails

    constructor(testRepository: TestRepository) {
        this.getTestQuestions = new GetTestQuestionsC(testRepository)
        this.getTests = new GetTestsC(testRepository)
        this.getTestDetails = new GetTestDetailsC(testRepository)
    }
}

export class TestsServices {
    commands: Commands;
    queries: Queries;
    testRepositories: TestRepository;

    constructor(
        testRepositories: TestRepository, cacheRepository: CacheRepository
    ) {
        this.testRepositories = testRepositories;
        this.commands = new Commands(testRepositories, cacheRepository);
        this.queries = new Queries(testRepositories);
    }
}
