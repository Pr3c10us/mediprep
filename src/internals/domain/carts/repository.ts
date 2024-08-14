import {AddItem2Cart, Cart, CartItem} from "./cart";

export interface CartRepository {
    AddItem: (params: AddItem2Cart) => Promise<void>
    RemoveItem: (itemID: string,userID: string) => Promise<void>
    ClearCart: (userID: string) => Promise<void>
    GetCart: (userID: string) => Promise<Cart>
}