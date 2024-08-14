import {CartRepository} from "../../../domain/carts/repository";

export interface RemoveItemFromCartCommand {
    Handle: (itemID: string, userID: string) => Promise<void>;
}

export class RemoveItemFromCartCommandC implements RemoveItemFromCartCommand {
    cartRepository: CartRepository;

    constructor(
        cartRepository: CartRepository,
    ) {
        this.cartRepository = cartRepository;
    }

    Handle = async (itemID: string, userID: string): Promise<void> => {
        try {
            await this.cartRepository.RemoveItem(itemID, userID)
        } catch (error) {
            throw error;
        }
    };
}
