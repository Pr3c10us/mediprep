import { AdminRepository } from "../../domain/admins/repository";
import { AddAdminCommand, addAdminCommand } from "./command/addAdmin";
import {
    AuthenticateAdmin,
    authenticateAdmin,
} from "./command/authenticateAdmin";

export class Commands {
    addAdmin: AddAdminCommand;
    authenticateAdmin: AuthenticateAdmin;

    constructor(repository: AdminRepository) {
        this.addAdmin = new addAdminCommand(repository);
        this.authenticateAdmin = new authenticateAdmin(repository);
    }
}

export class Queries {
    constructor(repository: AdminRepository) {}
}

export class AdminServices {
    Commands: Commands;
    Queries: Queries;
    adminRepository: AdminRepository;

    constructor(repository: AdminRepository) {
        this.adminRepository = repository;
        this.Commands = new Commands(repository);
        this.Queries = new Queries(repository);
    }
}
