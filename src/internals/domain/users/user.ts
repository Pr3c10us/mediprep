export type User = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    profession: string;
    country: string;
    verified? : boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type EditUser = {
    firstName?: string;
    lastName?: string;
    email?: string;
    profession?: string;
    country?: string;
    verified? : boolean;
    password?: string;
}

export type UserExamAccess = {
    userId:string;
    examId: string;
    expiryDate: Date;
}