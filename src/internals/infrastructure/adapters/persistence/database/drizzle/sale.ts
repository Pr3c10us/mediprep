import { UserExamAccessRepository } from "../../../../../domain/sales/repository";
import { PoolClient } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from '../../../../../../../stack/drizzle/schema/sales'
import { SaleItems, Sales } from '../../../../../../../stack/drizzle/schema/sales'
import * as schema2 from "../../../../../../../stack/drizzle/schema/exams"
import { Exams } from "../../../../../../../stack/drizzle/schema/exams"
import * as schema3 from "../../../../../../../stack/drizzle/schema/users"
import { Users } from "../../../../../../../stack/drizzle/schema/users"
import * as schemaCart from "../../../../../../../stack/drizzle/schema/cart";
import { Carts } from "../../../../../../../stack/drizzle/schema/cart";
import { AddSaleParams, Sale, SaleItem } from "../../../../../domain/sales/sale";
import { PaginationFilter, PaginationMetaData } from "../../../../../../pkg/types/pagination";
import { and, count, eq } from "drizzle-orm";
import { BadRequestError, UnAuthorizedError } from "../../../../../../pkg/errors/customError";

export class SalesRepositoryDrizzle implements UserExamAccessRepository {
    db

    constructor(client: PoolClient) {
        this.db = drizzle(client, {
            schema: {
                ...schema, ...schema2, ...schema3, ...schemaCart
            }
        })

    }

    AddSaleByItems = async (item: SaleItem, userID: string): Promise<string> => {
        const exam = await this.db.query.Exams.findFirst({
            where: eq(Exams.id, item.examID),
            with: {
                discounts: true,
            }
        })
        if (!exam) {
            throw new BadRequestError('Exam does not exist')
        }

        const user = await this.db.query.Users.findFirst({
            where: eq(Users.id, userID),
        })
        if (!user) {
            throw new UnAuthorizedError('Exam does not exist')
        }

        const discount = exam.discounts.find((discount) => discount.month == item.months)
        let examPrice: number = 0
        if (!discount) {
            examPrice = Number(exam.subscriptionAmount) * Number(item.months)
        } else {
            if (discount.type == 'flat') {
                examPrice = (Number(exam.subscriptionAmount) - Number(discount.value)) * discount.month
            }
            if (discount.type == 'percent') {
                const price = Number(exam.subscriptionAmount)
                const priceDiscount = price * (Number(discount.value) / 100)
                examPrice = (price - priceDiscount) * discount.month
            }
            examPrice = Number(exam.subscriptionAmount) * Number(item.months)
        }


        let saleID = ""
        await this.db.transaction(async (tx) => {
            try {
                const saleRes = await tx.insert(Sales).values(
                    {
                        userId: user.id,
                        amount: examPrice,
                        email: user.email,
                    }
                ).returning({ id: Sales.id })
                saleID = saleRes[0].id

                const saleItems = [{
                    months: Number(item.months),
                    price: Number(examPrice),
                    saleID: saleID,
                    examID: item.examID,
                }]

                await tx.insert(SaleItems).values(saleItems)
            } catch (error) {
                tx.rollback()
                throw error
            }
        })

        if (!saleID || saleID == "") {
            throw new Error("failed to initiate sale")
        }

        return saleID
    }

    AddSale = async (params: AddSaleParams): Promise<{ totalPrice: number, saleID: string }> => {
        try {
            const cart = await this.db.query.Carts.findFirst({
                where: and(eq(Carts.userID, params.userID), eq(Carts.id, params.cartID)),
                with: {
                    cartItems: {
                        with: {
                            exam: {
                                with: {
                                    discounts: true
                                },
                            }
                        }
                    }
                }
            })
            if (!cart) {
                throw new UnAuthorizedError('try login again')
            }
            if (cart.cartItems.length < 1) {
                throw new BadRequestError("empty cart")
            }

            let totalPrice: number = 0
            let examPrices = cart.cartItems.map((item): number => {
                const discount = item.exam.discounts.find((discount) => discount.month == item.months)
                if (!discount) {
                    return Number(item.exam.subscriptionAmount) * Number(item.months)
                } else {
                    if (discount.type == 'flat') {
                        return (Number(item.exam.subscriptionAmount) - Number(discount.value)) * discount.month
                    }
                    if (discount.type == 'percent') {
                        const examPrice = Number(item.exam.subscriptionAmount)
                        const priceDiscount = examPrice * (Number(discount.value) / 100)
                        return (examPrice - priceDiscount) * discount.month
                    }
                    return Number(item.exam.subscriptionAmount) * Number(item.months)
                }
            })
            for (let i = 0; i < examPrices.length; i++) {
                totalPrice += examPrices[i]
            }

            let saleID = ""
            await this.db.transaction(async (tx) => {
                try {
                    const saleRes = await tx.insert(Sales).values(
                        {
                            userId: params.userID,
                            amount: totalPrice,
                            email: params.email,
                        }
                    ).returning({ id: Sales.id })
                    saleID = saleRes[0].id

                    const saleItems = cart.cartItems.map((item): Omit<SaleItem, "id"> => {
                        return {
                            months: Number(item.months),
                            price: Number(item.price),
                            saleID: saleID,
                            examID: item.examID,
                        }
                    })
                    await tx.insert(SaleItems).values(saleItems)
                } catch (error) {
                    tx.rollback()
                    throw error
                }
            })

            if (!saleID || saleID == "") {
                throw new Error("failed to initiate sale")
            }

            return { totalPrice, saleID: saleID }
        } catch (error) {
            throw error
        }
    }

    GetSaleDetail = async (id: string): Promise<Sale> => {
        try {
            const sale = await this.db.query.Sales.findFirst({
                where: eq(Sales.id, id),
                with: {
                    user: {
                        columns: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    saleItems: {
                        with: {
                            exam: true
                        }
                    }
                }
            })

            if (!sale) {
                throw new BadRequestError(`sale with ${id} does not exist`)
            }
            return {
                id: sale.id as string,
                userId: sale.userId as string,
                reference: sale.reference as string,
                accessCode: sale.accessCode as string,
                paymentGateway: sale.paymentGateway,
                amount: sale.amount as number,
                email: sale.email as string,
                status: sale.status as string,
                createdAt: sale.createdAt as Date,
                updatedAt: sale.updatedAt as Date,
                firstName: sale.user?.firstName,
                lastName: sale.user?.lastName,
                saleItems: sale.saleItems.map((item): SaleItem => {
                    return {
                        id: item.id,
                        months: item.months,
                        price: Number(item.price),
                        saleID: item.saleID,
                        examID: item.examID,
                        exam: {
                            id: item.exam.id as string,
                            name: item.exam.name as string,
                            createdAt: item.exam.createdAt as Date,
                            updatedAt: item.exam.updatedAt as Date,
                            description: item.exam.description as string,
                            imageURL: item.exam.imageURL as string,
                            subscriptionAmount: Number(item.exam.subscriptionAmount),
                            mockQuestions: item.exam.mockQuestions as number,
                            totalMockScores: item.exam.totalMockScores,
                            mocksTaken: item.exam.mocksTaken,
                            mockTestTime: item.exam.mockTestTime,
                        }
                    }
                })
            }
        } catch (error) {
            throw error
        }
    }

    GetSaleByReference = async (reference: string): Promise<Sale> => {
        try {
            const sale = await this.db.query.Sales.findFirst({
                where: eq(Sales.reference, reference),
                with: {
                    user: {
                        columns: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    saleItems: {
                        with: {
                            exam: true
                        }
                    }
                }
            })

            if (!sale) {
                throw new BadRequestError(`sale with ${reference} does not exist`)
            }
            return {
                id: sale.id as string,
                userId: sale.userId as string,
                reference: sale.reference as string,
                accessCode: sale.accessCode as string,
                paymentGateway: sale.paymentGateway,
                amount: sale.amount as number,
                email: sale.email as string,
                status: sale.status as string,
                createdAt: sale.createdAt as Date,
                updatedAt: sale.updatedAt as Date,
                firstName: sale.user?.firstName,
                lastName: sale.user?.lastName,
                saleItems: sale.saleItems.map((item): SaleItem => {
                    return {
                        id: item.id,
                        months: item.months,
                        price: Number(item.price),
                        saleID: item.saleID,
                        examID: item.examID,
                        exam: {
                            id: item.exam.id as string,
                            name: item.exam.name as string,
                            createdAt: item.exam.createdAt as Date,
                            updatedAt: item.exam.updatedAt as Date,
                            description: item.exam.description as string,
                            totalMockScores: item.exam.totalMockScores,
                            mocksTaken: item.exam.mocksTaken,
                            mockTestTime: item.exam.mockTestTime,
                            imageURL: item.exam.imageURL as string,
                            subscriptionAmount: Number(item.exam.subscriptionAmount),
                            mockQuestions: item.exam.mockQuestions as number,
                        }
                    }
                })
            }
        } catch (error) {
            throw error
        }
    }

    GetSales = async (filter: PaginationFilter): Promise<{ sales: Sale[]; metadata: PaginationMetaData }> => {
        try {

            let filters = []
            // if (filter.startDate || filter.startDate != undefined) {
            //     filters.push(gte(Sales.createdAt, filter.startDate as Date))
            // }
            // if (filter.endDate || filter.endDate != undefined) {
            //     filters.push(lte(Sales.createdAt, filter.endDate as Date))
            // }
            if (filter.reference) {
                filters.push(eq(Sales.reference, filter.reference as string))
            }
            if (filter.userId) {
                filters.push(eq(Sales.userId, filter.userId as string))
            }
            // Get the total count of rows
            const totalResult = await this.db.select({ count: count() }).from(Sales).where(and(...filters));
            const total = totalResult[0].count;
            if (total <= 0) {
                return {
                    sales: [], metadata: {
                        total: 0,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            // const query = this.db.select().from(Sales);
            const sales = await this.db.query.Sales.findMany({
                where: and(...filters),
                with: {
                    user: {
                        columns: {
                            firstName: true,
                            lastName: true
                        }
                    },
                },
                limit: filter.limit,
                offset: (filter.page - 1) * filter.limit,
                orderBy: Sales.createdAt
            });

            if (sales.length > 0) {
                return {
                    sales: sales.map((sale): Sale => {
                        return {
                            id: sale.id as string,
                            userId: sale.userId as string,
                            reference: sale.reference as string,
                            accessCode: sale.accessCode as string,
                            paymentGateway: sale.paymentGateway,
                            amount: sale.amount as number,
                            email: sale.email as string,
                            status: sale.status as string,
                            createdAt: sale.createdAt as Date,
                            updatedAt: sale.updatedAt as Date,
                            firstName: sale.user?.firstName,
                            lastName: sale.user?.lastName,
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            return { sales: [], metadata: { total: 0, perPage: filter.limit, currentPage: filter.page } }

        } catch (error) {
            throw error
        }
    }

    UpdateSale = async (params: Partial<Sale>): Promise<void> => {
        try {
            if (!params.id || !params.userId) {
                throw new BadRequestError("provide necessary info")
            }
            await this.db.update(Sales).set(params).where(and(eq(Sales.userId, params.userId), eq(Sales.id, params.id)))
        } catch (error) {
            throw error
        }
    }

}