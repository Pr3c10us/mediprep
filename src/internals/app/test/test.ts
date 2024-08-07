import {TestRepository} from "../../domain/tests/repository";
import {CreateTest, CreateTestC} from "./command/createTest";
import {ScoreTest, ScoreTestC} from "./command/scoreTest";
import {GetTestQuestions, GetTestQuestionsC} from "./query/getTestQuestions";
import {GetTests, GetTestsC} from "./query/getTests";
import {GetTestDetails, GetTestDetailsC} from "./query/getTestDetails";

export class Commands {
    createTest: CreateTest
    scoreTest: ScoreTest

    constructor(testRepository: TestRepository) {
        this.createTest = new CreateTestC(testRepository)
        this.scoreTest = new ScoreTestC(testRepository)
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
        testRepositories: TestRepository
    ) {
        this.testRepositories = testRepositories;
        this.commands = new Commands(testRepositories);
        this.queries = new Queries(testRepositories);
    }
}
