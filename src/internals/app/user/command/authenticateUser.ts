import {BadRequestError, UnAuthorizedError,} from "../../../../pkg/errors/customError";
import {compareHash, signToken} from "../../../../pkg/utils/encryption";
import {UserRepository} from "../../../domain/users/repository";
import {User} from "../../../domain/users/user";

export interface AuthenticateUser {
    Handle: (email: string, password: string) => Promise<{ user: User, token: string }>;
}

export class AuthenticateUserC implements AuthenticateUser {
    repository: UserRepository;

    constructor(repository: UserRepository) {
        this.repository = repository;
    }

    Handle = async (email: string, password: string): Promise<{ user: User, token: string }> => {
        try {
            const user = await this.repository.getUserByEmail(email);
            if (!user?.email || user?.email != email) {
                throw new BadRequestError(`invalid email address ${email}`);
            }
            const passwordCorrect = compareHash(password, user.password);
            if (!passwordCorrect) {
                throw new UnAuthorizedError(`invalid password`);
            }

            const payload = {id: user.id};
            const token = signToken(payload);

            return {user, token};
        } catch (error) {
            throw error;
        }
    };
}
