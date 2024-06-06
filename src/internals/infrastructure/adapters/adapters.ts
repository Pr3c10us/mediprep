import { PoolClient } from "pg";
import { AdminRepository } from "../../domain/admins/repository";
import { AdminRepositoryPG } from "./persistence/posgresql/admin";

export class Adapter {
    AdminRepository: AdminRepository;
    constructor(dbClient: PoolClient) {
        this.AdminRepository = new AdminRepositoryPG(dbClient);
    }
}
