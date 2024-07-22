import {PaginationMetaData} from "../../../../pkg/types/pagination";
import {UserRepository} from "../../../domain/users/repository";
import {User} from "../../../domain/users/user";

export interface GetUserDetailsQuery {
    handle: (id: string) => Promise<User>
}

export class GetUserDetailsQueryC implements GetUserDetailsQuery {
    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    handle = async (id: string): Promise<User> => {
        try {
            const user = await this.userRepository.getUserDetailsWithAnalytics(id);
            return user;
        } catch (error) {
            throw error
        }
    };
}
