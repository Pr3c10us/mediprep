import {
    BadRequestError,
    UnAuthorizedError,
} from "../../../../pkg/errors/customError";
import { compareHash, signToken } from "../../../../pkg/utils/encryption";
import { UserRepository } from "../../../domain/users/repository";

export interface AuthenticateUser {
    Handle: (email: string, password: string) => Promise<string | void>;
}

export class AuthenticateUserC implements AuthenticateUser {
    repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    Handle = async (email: string, password: string): Promise<string> => {
        try {
            const user = await this.repository.getUserByEmail(email);
            if (!user?.email || user?.email != email) {
                throw new BadRequestError(`invalid email address ${email}`);
            }
            const passwordCorrect = compareHash(password, user.password);
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`invalid password`);
            }

            const payload = { id: user.id };
            const token = signToken(payload);

            return token;
        } catch (error) {
            throw error;
        }
    };
}
