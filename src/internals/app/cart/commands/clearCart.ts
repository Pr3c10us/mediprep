import {CartRepository} from "../../../domain/carts/repository";

export interface ClearCartCommand {
    Handle: (userID: string) => Promise<void>;
}

export class ClearCartCommandC implements ClearCartCommand {
    cartRepository: CartRepository;

    constructor(
        cartRepository: CartRepository,
    ) {
        this.cartRepository = cartRepository;
    }

    Handle = async (userID: string): Promise<void> => {
        try {
            await this.cartRepository.ClearCart(userID)
        } catch (error) {
            throw error;
        }
    };
}
