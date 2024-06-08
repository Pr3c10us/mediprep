import { BadRequestError } from "../../../../pkg/errors/customError";
import { encrypt } from "../../../../pkg/utils/encryption";
import { generateRandomPassword } from "../../../../pkg/utils/generateValue";
import { Admin } from "../../../domain/admins/admin";
import { AdminRepository } from "../../../domain/admins/repository";

export interface AddAdminCommand {
    Handle: (admin: Admin) => Promise<string | void>;
}

export class addAdminCommand implements AddAdminCommand {
    repository: AdminRepository;

    constructor(repository: AdminRepository) {
        this.repository = repository;
    }

    Handle = async (admin: Admin): Promise<string | void> => {
        try {
            const emailExist = await this.repository.GetAdminByEmail(
                admin.email
            );
            if (emailExist) {
                throw new BadRequestError(
                    `email address ${admin.email} used`
                );
            }
            const generatedPassword = admin.password
                ? admin.password
                : generateRandomPassword();

            admin.password = await encrypt(generatedPassword);

            await this.repository.AddAdmin(admin);
            // Send credentials to mail

            return generatedPassword;
        } catch (error) {
            throw error;
        }
    };
}
