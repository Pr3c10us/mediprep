import {SaleItem} from "../../../domain/sales/sale";
import {UserExamAccessRepository} from "../../../domain/sales/repository";
import {UserRepository} from "../../../domain/users/repository";
import {BadRequestError} from "../../../../pkg/errors/customError";

export interface ExamSubscribe {
    Handle: (reference: string) => Promise<void>;
    HandleWithoutPay: (item: SaleItem, userID: string) => Promise<void>
}

export class ExamSubscribeC implements ExamSubscribe {
    salesRepository: UserExamAccessRepository
    userRepository: UserRepository

    constructor(salesRepository: UserExamAccessRepository, userRepository: UserRepository) {
        this.salesRepository = salesRepository
        this.userRepository = userRepository
    }

    HandleWithoutPay = async (item: SaleItem, userID: string): Promise<void> => {
        try {
            const saleID = await this.salesRepository.AddSaleByItems(item, userID)
            await this.addUserExamAccess(item, userID)
            await this.salesRepository.UpdateSale({
                userId: userID,
                id: saleID,
                status: "success"
            })
        } catch (e) {
            throw e
        }
    }

    Handle = async (reference: string) => {
        try {
            const sale = await this.salesRepository.GetSaleByReference(reference)
            if (!sale.saleItems || sale.saleItems.length < 1) {
                throw new BadRequestError("invalid sale")
            }
            if (sale.status != "pending") {
                throw new BadRequestError("sale completed")
            }

            const saleItems: SaleItem[] = sale.saleItems
            for await (let item of saleItems) {
                await this.addUserExamAccess(item, sale.userId)
            }

            await this.salesRepository.UpdateSale({
                userId: sale.userId,
                id: sale.id,
                status: "success"
            })

        } catch (error) {
            throw error
        }
    }

    addUserExamAccess = async (saleItem: SaleItem, userID: string) => {
        try {
            const userExamAccess = await this.userRepository.getUserExamAccess(saleItem.examID, userID)
                .then(async (response) => {
                    const date = response.expiryDate;
                    const newExpiryDate = this.calculateExpiryDate(saleItem.months, date);
                    await this.userRepository.updateExamAccess({
                        userId: userID,
                        examId: saleItem.examID,
                        expiryDate: newExpiryDate
                    });
                })
                .catch(async (error) => {
                    await this.userRepository.addUserExamAccess({
                        userId: userID,
                        examId: saleItem.examID,
                        expiryDate: this.calculateExpiryDate(saleItem.months)
                    });
                });
        } catch (error) {
            throw error
        }
    }

    calculateExpiryDate = (months: number, date?: Date): Date => {
        let now = date || new Date();
        now.setMonth(now.getMonth() + months);
        return now;
    };
}