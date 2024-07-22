import {Exam} from "../exams/exam";

export type User = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    profession?: string;
    country?: string;
    verified? : boolean;
    createdAt?: Date;
    updatedAt?: Date;
    blacklisted?:boolean;
    examsBought?: number;
    testNo?:number;
    mockNo?: number
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
    examId: string;
    userId: string;
    expiryDate?: Date;
    exam?: Exam
}