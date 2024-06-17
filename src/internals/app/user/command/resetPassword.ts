import {compareHash, encrypt} from "../../../../pkg/utils/encryption";
import {UserRepository} from "../../../domain/users/repository";
import {UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface ResetPassword {
    Handle: (id: string, newPassword: string, oldPassword?: string) => Promise<string | void>;
}

export class ResetPasswordC implements ResetPassword {
    repository: UserRepository;


    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    Handle = async (id: string, newPassword: string, oldPassword?: string): Promise<void> => {
        try {
            if (oldPassword || oldPassword != undefined) {
                const user = await this.repository.getUserDetails(id);
                const passwordCorrect = compareHash(oldPassword, user.password);
                if (!passwordCorrect) {
                    throw new UnAuthorizedError(`wrong password`);
                }
            }

            const encryptedPassword = await encrypt(newPassword);
            await this.repository.editUser(id, {password: encryptedPassword})

            return
        } catch (error) {
            throw error;
        }
    };
}
