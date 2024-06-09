import { AdminRepository } from "../../domain/admins/repository";
import { EmailQueueRepository } from "../../domain/queue/repository";
import { AddAdminCommand, AddAdminCommandC } from "./command/addAdmin";
import {
    AuthenticateAdmin,
    AuthenticateAdminC,
} from "./command/authenticateAdmin";

export class Commands {
    addAdmin: AddAdminCommand;
    authenticateAdmin: AuthenticateAdmin;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.addAdmin = new AddAdminCommandC(
            adminRepository,
            emailQueueRepository
        );
        this.authenticateAdmin = new AuthenticateAdminC(adminRepository);
    }
}

export class Queries {
    constructor(adminRepository: AdminRepository) {}
}

export class AdminServices {
    Commands: Commands;
    Queries: Queries;
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.adminRepository = adminRepository;
        this.Commands = new Commands(adminRepository, emailQueueRepository);
        this.Queries = new Queries(adminRepository);
    }
}
