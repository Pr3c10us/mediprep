import { AdminRepository } from "../../domain/admins/repository";
import { EmailRepository } from "../../domain/notification/repository";
import { SendMail, SendMailC } from "./command/sendMail";

export class Commands {
    sendMail: SendMail;

    constructor(repository: EmailRepository) {
        this.sendMail = new SendMailC(repository);
    }
}

export class Queries {
    constructor(repository: EmailRepository) {}
}

export class EmailServices {
    Commands: Commands;
    Queries: Queries;
    emailRepository: EmailRepository;

    constructor(repository: EmailRepository) {
        this.emailRepository = repository;
        this.Commands = new Commands(repository);
        this.Queries = new Queries(repository);
    }
}
