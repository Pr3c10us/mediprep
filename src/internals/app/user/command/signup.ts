import {encrypt, signToken} from "../../../../pkg/utils/encryption";
import {User} from "../../../domain/users/user";
import {Email} from "../../../domain/notification/email";
import {newEmailQueueRecord, Record} from "../../../domain/queue/producer";
import {QueueRepository} from "../../../domain/queue/repository";
import {UserRepository} from "../../../domain/users/repository";
import {Environment} from "../../../../pkg/configs/env";

export interface AddUserCommand {
    Handle: (user: User) => Promise<string | void>;
}

export class AddUserCommandC implements AddUserCommand {
    userRepository: UserRepository;
    queueRepository: QueueRepository;
    environmentVariables: Environment

    constructor(
        userRepository: UserRepository,
        queueRepository: QueueRepository
    ) {
        this.userRepository = userRepository;
        this.queueRepository = queueRepository;
        this.environmentVariables = new Environment()

    }

    Handle = async (user: User): Promise<void> => {
        try {

            user.password = await encrypt(user.password as string);

            const userResult = await this.userRepository.addUser(user);
            const payload = { id: userResult.id };
            const token = signToken(payload,false)

            // Send credentials to mail by publishing message to queue
            const email: Email = {
                subject: "User Account Verification",
                mailTo: [userResult.email],
                plainText: `
                Verify your account by clicking on this link: \n
                ${this.environmentVariables.url}/api/${this.environmentVariables.apiVersion}/user/onboarding/verify?jwt=${token}
                `,
            };
            const emailQueueRecord: Record = newEmailQueueRecord(email);
            await this.queueRepository.Produce(emailQueueRecord);
        } catch (error) {
            throw error;
        }
    };
}
