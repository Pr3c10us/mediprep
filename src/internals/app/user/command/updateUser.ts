import {User} from "../../../domain/users/user";
import {QueueRepository} from "../../../domain/queue/repository";
import {UserRepository} from "../../../domain/users/repository";
import {Environment} from "../../../../pkg/configs/env";
import {BadRequestError} from "../../../../pkg/errors/customError";

export interface UpdateUserCommand {
    Handle: (user: Partial<User>) => Promise<User>;
}

export class UpdateUserCommandC implements UpdateUserCommand {
    userRepository: UserRepository;
    environmentVariables: Environment

    constructor(
        userRepository: UserRepository,
    ) {
        this.userRepository = userRepository;
        this.environmentVariables = new Environment()

    }

    Handle = async (user: Partial<User>): Promise<User> => {
        try {
            if (!user.id) {
                throw new BadRequestError("provide user id")
            }
            const userResult = await this.userRepository.updateUser(user);
            return userResult
        } catch (error) {
            throw error;
        }
    };
}
