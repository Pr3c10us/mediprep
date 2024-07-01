import {UserExamAccessRepository} from "../../domain/examAccess/repository";
import {GetUserExamsQuery, GetUserExamsQueryC} from "./query/getUserExams";
import {GetUseExamDetailsQuery, GetUseExamDetailsQueryC} from "./query/getUserExamAccessDetails";

export class Commands {

    constructor() {
    }
}

export class Queries {
    getUserExams: GetUserExamsQuery
    getUseExamDetails: GetUseExamDetailsQuery

    constructor(userExamAccessRepository: UserExamAccessRepository
    ) {
        this.getUserExams = new GetUserExamsQueryC(userExamAccessRepository)
        this.getUseExamDetails = new GetUseExamDetailsQueryC(userExamAccessRepository)
    }
}

export class UserExamAccessService {
    commands: Commands;
    queries: Queries;
    salesRepository: UserExamAccessRepository;

    constructor(userExamAccessRepository: UserExamAccessRepository,) {
        this.salesRepository = userExamAccessRepository;
        this.commands = new Commands();
        this.queries = new Queries(userExamAccessRepository);
    }
}
