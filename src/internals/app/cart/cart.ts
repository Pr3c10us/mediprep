import {CartRepository} from "../../domain/carts/repository";
import {AddItem2CartCommand, AddItem2CartCommandC} from "./commands/AddItem2Cart";
import {ClearCartCommand, ClearCartCommandC} from "./commands/clearCart";
import {RemoveItemFromCartCommand, RemoveItemFromCartCommandC} from "./commands/removeItemFromCart";
import {GetCartCommand, GetCartCommandC} from "./queries/getCart";

export class Commands {
    addItem2Cart: AddItem2CartCommand
    removeItemFromCart: RemoveItemFromCartCommand
    clearCart: ClearCartCommand

    constructor(
        cartRepository: CartRepository,
    ) {
        this.addItem2Cart = new AddItem2CartCommandC(cartRepository)
        this.clearCart = new ClearCartCommandC(cartRepository)
        this.removeItemFromCart = new RemoveItemFromCartCommandC(cartRepository)
    }
}

export class Queries {
    getCart: GetCartCommand

    constructor(cartRepository: CartRepository) {
        this.getCart = new GetCartCommandC(cartRepository)
    }
}

export class CartServices {
    commands: Commands;
    queries: Queries;

    constructor(
        cartRepository: CartRepository,
    ) {
        this.commands = new Commands(cartRepository);
        this.queries = new Queries(cartRepository);
    }
}
