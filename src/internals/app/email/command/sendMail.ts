import { Email } from "../../../domain/notification/email";
import { EmailRepository } from "../../../domain/notification/repository";

export interface SendMail {
    Handle: (email: Email) => Promise<void>;
}

export class SendMailC implements SendMail {
    repository: EmailRepository;

    constructor(repository: EmailRepository) {
        this.repository = repository;
    }
    Handle = async (email: Email) => {
        try {
            await this.repository.SendMail(email);
        } catch (error) {
            throw error;
        }
    };
}
