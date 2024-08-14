import {AddItem2Cart} from "../../../domain/carts/cart";
import {CartRepository} from "../../../domain/carts/repository";

export interface AddItem2CartCommand {
    Handle: (params: AddItem2Cart) => Promise< void>;
}

export class AddItem2CartCommandC implements AddItem2CartCommand {
    cartRepository: CartRepository;

    constructor(
        cartRepository: CartRepository,
    ) {
        this.cartRepository = cartRepository;
    }

    Handle = async (params: AddItem2Cart): Promise< void> => {
        try {
            await this.cartRepository.AddItem(params)
        } catch (error) {
            throw error;
        }
    };
}
