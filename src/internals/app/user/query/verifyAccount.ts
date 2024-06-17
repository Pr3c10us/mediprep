import {UserRepository} from "../../../domain/users/repository";

export interface VerifyAccount {
    Handle:(id: string) => Promise<void>
}

export class VerifyAccountC implements VerifyAccount {
    userRepository: UserRepository;

    constructor(
        userRepository: UserRepository,
    ) {
        this.userRepository = userRepository;
    }

    Handle = async (id: string): Promise<void> => {
        try {
            await this.userRepository.editUser(id,{verified: true})
        }catch (error) {
            throw error
        }
    }
}