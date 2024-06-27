export type Sale = {
    id?: string;
    userId: string;
    examId: string;
    reference: string;
    amount: number;
    email: string;
    status: string;
    expiryDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}