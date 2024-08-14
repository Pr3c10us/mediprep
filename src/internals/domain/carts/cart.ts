import {Exam} from "../exams/exam";

export type Cart = {
    id : string;
    userID: string;
    totalPrice: number
    cartItems: CartItem[]
}

export type CartItem ={
    id?: string;
    months: number;
    price: number;
    cartID?: string;
    examID: string;
    exam?: Exam
}

export type AddItem2Cart = {
    userID: string;
    cartItem: CartItem
}