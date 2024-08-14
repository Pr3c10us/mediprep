import {Cart} from "../../../domain/carts/cart";
import {CartRepository} from "../../../domain/carts/repository";

export interface GetCartCommand {
    Handle: (userID: string) => Promise<Cart>;
}

export class GetCartCommandC implements GetCartCommand {
    cartRepository: CartRepository;

    constructor(
        cartRepository: CartRepository,
    ) {
        this.cartRepository = cartRepository;
    }

    Handle = async (userID: string): Promise<Cart> => {
        try {
            return await this.cartRepository.GetCart(userID)
        } catch (error) {
            throw error;
        }
    };
}
