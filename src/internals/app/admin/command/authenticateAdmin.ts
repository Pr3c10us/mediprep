import {
    BadRequestError,
    UnAuthorizedError,
} from "../../../../pkg/errors/customError";
import {
    compareHash,
    signToken,
} from "../../../../pkg/utils/encryption";
import { AdminRepository } from "../../../domain/admins/repository";

export interface AuthenticateAdmin {
    Handle: (email: string, password: string) => Promise<string | void>;
}

export class authenticateAdmin implements AuthenticateAdmin {
    repository: AdminRepository;

    constructor(repository: AdminRepository) {
        this.repository = repository;
    }

    Handle = async (email: string, password: string): Promise<string> => {
        try {
            const admin = await this.repository.GetAdminByEmail(email);
            if (!admin) {
                throw new BadRequestError(
                    `invalid email address ${email}`
                );
            }
            const passwordCorrect = compareHash(password, admin.password)
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`invalid password`);
            }

            const payload = { id: admin.id };
            const token = signToken(payload);

            return token;
        } catch (error) {
            throw error;
        }
    };
}
