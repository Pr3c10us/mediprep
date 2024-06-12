import { PaginationFilter } from "../../../../pkg/types/pagination";
import { Admin } from "../../../domain/admins/admin";
import { AdminRepository } from "../../../domain/admins/repository";

export class GetAdmins {
    adminRepository: AdminRepository;
    constructor(adminRepository: AdminRepository) {
        this.adminRepository = adminRepository;
    }

    handle = async (filter: PaginationFilter): Promise<Admin[]> => {
        try {
            const admins: Admin[] = await this.adminRepository.GetAdmins(
                filter
            );
            return admins;
        } catch (error) {
            throw error
        }
    };
}
