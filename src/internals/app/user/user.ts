import {UserRepository} from "../../domain/users/repository";
import {VerifyAccount, VerifyAccountC} from "./query/verifyAccount";
import {AddUserCommand, AddUserCommandC} from "./command/signup";
import {QueueRepository} from "../../domain/queue/repository";
import {AuthenticateUser, AuthenticateUserC} from "./command/authenticateUser";
import {SendJWTQuery, SendJWTQueryC} from "./query/sendJWTQuery";
import {ResetPassword, ResetPasswordC} from "./command/resetPassword";
import {GetUsersQuery, GetUsersQueryC} from "./query/getUsers";
import {UpdateUserCommand, UpdateUserCommandC} from "./command/updateUser";
import {GetUserDetailsQuery, GetUserDetailsQueryC} from "./query/getUserDetails";

export class Commands {
    addUser: AddUserCommand
    updateUser: UpdateUserCommand
    authenticateUser: AuthenticateUser
    resetPassword: ResetPassword

    constructor(
        userRepository: UserRepository,
        queueRepository: QueueRepository
    ) {
        this.updateUser = new UpdateUserCommandC(userRepository)
        this.addUser = new AddUserCommandC(userRepository, queueRepository)
        this.authenticateUser = new AuthenticateUserC(userRepository)
        this.resetPassword = new ResetPasswordC(userRepository)
    }
}

export class Queries {
    verifyAccount: VerifyAccount
    sendJWT: SendJWTQuery
    getUsers: GetUsersQuery
    getUserDetails: GetUserDetailsQuery

    constructor(userRepository: UserRepository, emailQueueRepository: QueueRepository
    ) {
        this.verifyAccount = new VerifyAccountC(userRepository)
        this.sendJWT = new SendJWTQueryC(userRepository, emailQueueRepository)
        this.getUsers = new GetUsersQueryC(userRepository)
        this.getUserDetails = new GetUserDetailsQueryC(userRepository)
    }
}

export class UserServices {
    commands: Commands;
    queries: Queries;
    userRepository: UserRepository;

    constructor(
        userRepository: UserRepository,
        queueRepository: QueueRepository
    ) {
        this.userRepository = userRepository;
        this.commands = new Commands(userRepository, queueRepository);
        this.queries = new Queries(userRepository, queueRepository);
    }
}
