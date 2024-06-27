import {SalesRepository} from "../../domain/sales/repository";
import {UserRepository} from "../../domain/users/repository";
import {ExamRepository} from "../../domain/exams/repository";
import {Subscribe, SubscribeC} from "./comand/subscribe";

export class Commands {
    subscribe: Subscribe

    constructor(
        salesRepository: SalesRepository, userRepository: UserRepository, examRepository: ExamRepository
    ) {
        this.subscribe = new SubscribeC(salesRepository,userRepository,examRepository)
    }
}

export class Queries {

    constructor(salesRepository: SalesRepository
    ) {
    }
}

export class SalesServices {
    commands: Commands;
    queries: Queries;
    salesRepository: SalesRepository;

    constructor(
        salesRepository: SalesRepository, userRepository: UserRepository, examRepository: ExamRepository
    ) {
        this.salesRepository = salesRepository;
        this.commands = new Commands(salesRepository, userRepository, examRepository);
        this.queries = new Queries(salesRepository);
    }
}
