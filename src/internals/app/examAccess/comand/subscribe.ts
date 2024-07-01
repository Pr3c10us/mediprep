import {Sale} from "../../../domain/sales/sale";
import {UserExamAccessRepository} from "../../../domain/sales/repository";
import {UserRepository} from "../../../domain/users/repository";
import {ExamRepository} from "../../../domain/exams/repository";
import {User} from "../../../domain/users/user";

export interface Subscribe {
    Handle: (sale: Sale) => Promise<void>
}

export class SubscribeC implements Subscribe {
    salesRepository: UserExamAccessRepository
    userRepository: UserRepository
    examRepository: ExamRepository

    constructor(salesRepository: UserExamAccessRepository, userRepository: UserRepository, examRepository: ExamRepository) {
        this.salesRepository = salesRepository
        this.userRepository = userRepository
        this.examRepository = examRepository
    }

    Handle = async (sale: Sale) => {
        try {
            let user: User;
            try {
                user = await this.userRepository.getUserDetails(sale.userId);
            } catch (error) {
                user = await this.userRepository.getUserByEmail(sale.email);
            }

            const exam = await this.examRepository.GetExamById(sale.examId);
            const perDayAmount = exam.subscriptionAmount / 30;

            const calculateExpiryDate = (date?: Date): Date => {
                let now = date || new Date();
                const validDays = Math.floor(sale.amount / perDayAmount); // round down to save cost from app end
                return new Date(now.setDate(now.getDate() + validDays));
            };

            try {
                const userExamAccess = await this.userRepository.getUserExamAccess(exam.id as string, user.id as string);
                const date = userExamAccess.expiryDate;
                const newExpiryDate = calculateExpiryDate(date);

                await this.salesRepository.AddSale({
                    userId: user.id as string,
                    examId: exam.id as string,
                    reference: sale.reference,
                    amount: sale.amount,
                    email: sale.email,
                    status: sale.status,
                    expiryDate: newExpiryDate
                });

                await this.userRepository.updateExamAccess({
                    userId: userExamAccess.userId,
                    examId: userExamAccess.examId,
                    expiryDate: newExpiryDate
                });

            } catch (error) {
                const newExpiryDate = calculateExpiryDate();

                await this.salesRepository.AddSale({
                    userId: user.id as string,
                    examId: exam.id as string,
                    reference: sale.reference,
                    amount: sale.amount,
                    email: sale.email,
                    status: sale.status,
                    expiryDate: newExpiryDate
                });

                await this.userRepository.addUserExamAccess({
                    userId: user.id as string,
                    examId: exam.id as string,
                    expiryDate: newExpiryDate
                });
            }
        } catch (error) {
            throw error;
        }
    }

}