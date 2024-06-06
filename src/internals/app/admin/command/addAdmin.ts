import { Admin } from "../../../domain/admins/admin";
import { AdminRepository } from "../../../domain/admins/repository";

export interface AddAdminCommand {
    Handle: (admin: Admin) => Promise<Admin>;
}

export class addAdminCommand implements AddAdminCommand {
    repository: AdminRepository;

    constructor(repository: AdminRepository) {
        this.repository = repository;
    }

    Handle = async (admin: Admin): Promise<Admin> => {
        try {
            return this.repository.AddAdmin(admin);
        } catch (error) {
            throw error;
        }
    };
}
