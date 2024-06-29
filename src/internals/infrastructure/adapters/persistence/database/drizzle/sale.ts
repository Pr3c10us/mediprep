import {SalesRepository} from "../../../../../domain/sales/repository";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from '../../../../../../../stack/drizzle/schema/sales'
import {Sales} from '../../../../../../../stack/drizzle/schema/sales'
import * as schema2 from "../../../../../../../stack/drizzle/schema/exams"
import * as schema3 from "../../../../../../../stack/drizzle/schema/users"
import {Sale} from "../../../../../domain/sales/sale";
import {PaginationFilter, PaginationMetaData} from "../../../../../../pkg/types/pagination";
import {and, count, eq, gte, lte} from "drizzle-orm";
import {BadRequestError} from "../../../../../../pkg/errors/customError";

export class SalesRepositoryDrizzle implements SalesRepository {
    db

    constructor(client: PoolClient) {
        this.db = drizzle(client, {
            schema: {
                ...schema, ...schema2, ...schema3
            }
        })
    }

    AddSale = async (sale: Sale): Promise<void> => {
        try {
            await this.db.insert(Sales).values(
                {
                    userId: sale.userId,
                    examId: sale.examId,
                    reference: sale.reference,
                    amount: sale.amount,
                    expiryDate: sale.expiryDate,
                    email: sale.email,
                    status: sale.status,
                }
            )
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
                    exam: {
                        columns: {
                            name: true
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
                examId: sale.examId as string,
                reference: sale.reference as string,
                amount: sale.amount as number,
                expiryDate: sale.expiryDate as Date,
                email: sale.email as string,
                status: sale.status as string,
                createdAt: sale.createdAt as Date,
                updatedAt: sale.updatedAt as Date,
                firstName: sale.user?.firstName,
                lastName: sale.user?.lastName,
                examName: sale.exam?.name as string | undefined
            }
        } catch (error) {
            throw error
        }
    }

    GetSales = async (filter: PaginationFilter): Promise<{ sales: Sale[]; metadata: PaginationMetaData }> => {
        try {
            let filters = []
            if (filter.startDate || filter.startDate != undefined) {
                filters.push(gte(Sales.createdAt, filter.startDate as Date))
            }
            if (filter.endDate || filter.endDate != undefined) {
                filters.push(lte(Sales.createdAt, filter.endDate as Date))
            }
            if (filter.reference || filter.reference != undefined) {
                filters.push(eq(Sales.reference, filter.reference as string))
            }
            // Get the total count of rows
            const totalResult = await this.db.select({count: count()}).from(Sales).where(and(...filters));
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
                    exam: {
                        columns: {
                            name: true
                        }
                    }
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
                            examId: sale.examId as string,
                            reference: sale.reference as string,
                            amount: sale.amount as number,
                            expiryDate: sale.expiryDate as Date,
                            email: sale.email as string,
                            status: sale.status as string,
                            createdAt: sale.createdAt as Date,
                            updatedAt: sale.updatedAt as Date,
                            firstName: sale.user?.firstName,
                            lastName: sale.user?.lastName,
                            examName: sale.exam?.name as string | undefined
                        }
                    }), metadata: {
                        total: total,
                        perPage: filter.limit,
                        currentPage: filter.page
                    }
                }
            }
            return {sales: [], metadata: {total: 0, perPage: filter.limit, currentPage: filter.page}}

        } catch (error) {
            throw error
        }
    }

}