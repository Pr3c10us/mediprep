import {PaginationFilter, PaginationMetaData} from "../../../../pkg/types/pagination";
import {UserRepository} from "../../../domain/users/repository";
import {User} from "../../../domain/users/user";

export interface GetUsersQuery {
    handle: (filter: PaginationFilter) => Promise<{ users: User[], metadata: PaginationMetaData }>
}

export class GetUsersQueryC implements GetUsersQuery{
    userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    handle = async (filter: PaginationFilter): Promise<{ users: User[], metadata: PaginationMetaData }> => {
        try {
            const {users, metadata} = await this.userRepository.getUsers(
                filter
            );
            return {users, metadata};
        } catch (error) {
            throw error
        }
    };
}
