import {encrypt, signToken} from "../../../../pkg/utils/encryption";
import {Email} from "../../../domain/notification/email";
import {newEmailQueueRecord, Record} from "../../../domain/queue/producer";
import {EmailQueueRepository} from "../../../domain/queue/repository";
import {UserRepository} from "../../../domain/users/repository";
import {Environment} from "../../../../pkg/configs/env";
import {BadRequestError} from "../../../../pkg/errors/customError";

export interface SendJWTQuery {
    Handle: (email: string) => Promise<string | void>;
}

export class SendJWTQueryC implements SendJWTQuery {
    repository: UserRepository;
    emailQueueRepository: EmailQueueRepository;
    environmentVariables: Environment


    constructor(repository: UserRepository, emailQueueRepository: EmailQueueRepository) {
        this.repository = repository;
        this.emailQueueRepository = emailQueueRepository;
        this.environmentVariables = new Environment()
    }

    Handle = async (email: string): Promise<void> => {
        try {
            const user = await this.repository.getUserByEmail(email);
            if (!user?.email || user?.email != email) {
                throw new BadRequestError(`invalid email address ${email}`);
            }

            const payload = {id: user.id};
            const token = signToken(payload);

            // Send credentials to mail by publishing message to queue
            const emailO: Email = {
                subject: "Forgot Password",
                mailTo: [user.email],
                plainText: `
                Reset your password by clicking on this link: \n
                ${this.environmentVariables.resetPasswordURL}?jwt=${token}
                `,
            };
            const emailQueueRecord: Record = newEmailQueueRecord(emailO);
            await this.emailQueueRepository.Produce(emailQueueRecord);
        } catch (error) {
            throw error;
        }
    };
}
