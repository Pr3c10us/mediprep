import {UserRepository} from "../../domain/users/repository";
import {VerifyAccount, VerifyAccountC} from "./query/verifyAccount";
import {AddUserCommand, AddUserCommandC} from "./command/signup";
import {EmailQueueRepository} from "../../domain/queue/repository";

export class Commands {
    addUser:  AddUserCommand
    constructor(
        userRepository: UserRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.addUser = new AddUserCommandC(userRepository,emailQueueRepository)

    }
}

export class Queries {
    verifyAccount: VerifyAccount
    constructor(userRepository: UserRepository) {
        this.verifyAccount = new VerifyAccountC(userRepository)
    }
}

export class UserServices {
    commands: Commands;
    queries: Queries;
    userRepository: UserRepository;

    constructor(
        userRepository: UserRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.userRepository = userRepository;
        this.commands = new Commands(userRepository,emailQueueRepository);
        this.queries = new Queries(userRepository);
    }
}
