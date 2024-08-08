import { AdminRepository } from "../../../domain/admins/repository";

export interface RemoveAdminCommand {
    Handle: (adminId: string) => Promise<void>;
}

export class RemoveAdminCommandC implements RemoveAdminCommand {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }

    Handle = async (adminId: string): Promise<void> => {
        try {
            await this.adminRepository.RemoveAdmin(adminId)
        } catch (error) {
            throw error;
        }
    };
}