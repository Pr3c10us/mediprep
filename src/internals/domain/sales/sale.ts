import {Exam} from "../exams/exam";

export type Sale = {
    id: string;
    reference: string;
    accessCode: string;
    paymentGateway: string;
    amount: number;
    status: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    firstName?: string,
    lastName?: string,
    saleItems?: SaleItem[]
}

export type SaleItem = {
    id: string;
    months: number;
    price: number;
    saleID: string;
    examID: string;
    exam?: Exam
}

export type AddSaleParams = {
    userID: string,
    cartID: string,
    email: string,
}