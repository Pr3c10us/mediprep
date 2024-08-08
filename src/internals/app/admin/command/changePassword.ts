import {AdminRepository} from "../../../domain/admins/repository";
import {BadRequestError, UnAuthorizedError} from "../../../../pkg/errors/customError";
import {compareHash, encrypt} from "../../../../pkg/utils/encryption";

export interface ChangeAdminPasswordCommand {
    Handle: (id:string,oldPassword: string, newPassword: string) => Promise<void>;
}

export class ChangeAdminPasswordCommandC implements ChangeAdminPasswordCommand {
    adminRepository: AdminRepository;

    constructor(
        adminRepository: AdminRepository,
    ) {
        this.adminRepository = adminRepository;
    }

    Handle = async (id:string,oldPassword: string, newPassword: string): Promise<void> => {
        try {
            const admin = await this.adminRepository.GetAdminByID(id);
            if (!admin) {
                throw new BadRequestError(`invalid admin`);
            }
            const passwordCorrect = compareHash(oldPassword, admin.password);
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`wrong old password`);
            }

            await this.adminRepository.updateAdmin({id,password: await encrypt(newPassword)})
        } catch (error) {
            throw error;
        }
    };
}