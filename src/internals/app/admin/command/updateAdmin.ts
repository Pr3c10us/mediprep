import {AdminRepository} from "../../../domain/admins/repository";
import {Admin} from "../../../domain/admins/admin";
import {BadRequestError, UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface UpdateAdminCommand {
    Handle: (admin: Partial<Admin>) => Promise<void>;
}

export class UpdateAdminCommandC implements UpdateAdminCommand {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }

    Handle = async (admin: Partial<Admin>): Promise<void> => {
        try {
            if (!admin.id) {
                throw new UnAuthorizedError("admin login required")
            }
            await this.adminRepository.updateAdmin(admin)
        } catch (error) {
            throw error;
        }
    };
}