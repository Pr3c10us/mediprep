import { AdminRepository } from "../../domain/admins/repository";
import { EmailQueueRepository } from "../../domain/queue/repository";
import { AddAdminCommand, AddAdminCommandC } from "./command/addAdmin";
import {
    AuthenticateAdmin,
    AuthenticateAdminC,
} from "./command/authenticateAdmin";
import { GetAdmins } from "./query/getAdmins";

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
    getAdmins: GetAdmins;
    constructor(adminRepository: AdminRepository) {
        this.getAdmins = new GetAdmins(adminRepository);
    }
}

export class AdminServices {
    commands: Commands;
    queries: Queries;
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
        emailQueueRepository: EmailQueueRepository
    ) {
        this.adminRepository = adminRepository;
        this.commands = new Commands(adminRepository, emailQueueRepository);
        this.queries = new Queries(adminRepository);
    }
}
