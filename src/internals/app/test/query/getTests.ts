import {TestRepository} from "../../../domain/tests/repository";
import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {Test} from "../../../domain/tests/test";

export interface GetTests {
    Handle: (filter: PaginationFilter) => Promise<{ tests: Test[]; metadata: PaginationMetaData }>
}

export class GetTestsC implements GetTestsC {
    testRepositories: TestRepository

    constructor(testRepositories: TestRepository) {
        this.testRepositories = testRepositories
    }

    Handle = async (filter: PaginationFilter): Promise<{ tests: Test[]; metadata: PaginationMetaData }> => {
        try {
            return await this.testRepositories.getTests(filter)
        } catch (error) {
            throw error;
        }
    }

}