import {UserRepository} from "../../domain/users/repository";
import {VerifyAccount, VerifyAccountC} from "./query/verifyAccount";
import {AddUserCommand, AddUserCommandC} from "./command/signup";
import {EmailQueueRepository} from "../../domain/queue/repository";
import {AuthenticateUser, AuthenticateUserC} from "./command/authenticateUser";
import {SendJWTQuery, SendJWTQueryC} from "./query/sendJWTQuery";
import {ResetPassword, ResetPasswordC} from "./command/resetPassword";
import {GetUsersQuery, GetUsersQueryC} from "./query/getUsers";

export class Commands {
    addUser: AddUserCommand
    authenticateUser: AuthenticateUser
    resetPassword: ResetPassword

    constructor(
        userRepository: UserRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.addUser = new AddUserCommandC(userRepository, emailQueueRepository)
        this.authenticateUser = new AuthenticateUserC(userRepository)
        this.resetPassword = new ResetPasswordC(userRepository)
    }
}

export class Queries {
    verifyAccount: VerifyAccount
    sendJWT: SendJWTQuery
    getUsers: GetUsersQuery

    constructor(userRepository: UserRepository, emailQueueRepository: EmailQueueRepository
    ) {
        this.verifyAccount = new VerifyAccountC(userRepository)
        this.sendJWT = new SendJWTQueryC(userRepository, emailQueueRepository)
        this.getUsers = new GetUsersQueryC(userRepository)
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
        this.commands = new Commands(userRepository, emailQueueRepository);
        this.queries = new Queries(userRepository, emailQueueRepository);
    }
}
