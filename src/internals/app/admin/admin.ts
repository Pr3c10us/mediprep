import { AdminRepository } from "../../domain/admins/repository";
import { AddAdminCommand, addAdminCommand } from "./command/addAdmin";

export class Commands {
    AddAdmin: AddAdminCommand;

    constructor(repository: AdminRepository) {
        this.AddAdmin = new addAdminCommand(repository);
    }
}

export class Queries {
    constructor(repository: AdminRepository) {}
}

export class AdminServices {
    Commands: Commands;
    Queries: Queries;

    constructor(repository: AdminRepository) {
        this.Commands = new Commands(repository);
        this.Queries = new Queries(repository);
    }
}
