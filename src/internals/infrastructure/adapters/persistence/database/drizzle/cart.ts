import {CartRepository} from "../../../../../domain/carts/repository";
import {PoolClient} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schemaExam from "../../../../../../../stack/drizzle/schema/exams";
import {ExamDiscounts, Exams} from "../../../../../../../stack/drizzle/schema/exams";
import {AddItem2Cart, Cart, CartItem} from "../../../../../domain/carts/cart";
import * as schemaCart from "../../../../../../../stack/drizzle/schema/cart";
import {CartItems, Carts} from "../../../../../../../stack/drizzle/schema/cart";
import {and, eq} from "drizzle-orm";
import {BadRequestError, UnAuthorizedError} from "../../../../../../pkg/errors/customError";

export class CartRepositoryDrizzle implements CartRepository {
    db

    constructor(pool: PoolClient) {
        this.db = drizzle(pool, {schema: {...schemaExam, ...schemaCart}})
    }

    async AddItem(params: AddItem2Cart): Promise<void> {
        try {
            // get exam price
            const exam = await this.db.query.Exams.findFirst({
                where: eq(Exams.id, params.cartItem.examID),
                with: {
                    discounts: {
                        where: eq(ExamDiscounts.month, params.cartItem.months)
                    }
                },
            })
            if (!exam) {
                throw new BadRequestError('Exam does not exist')
            }

            let price: number = 0
            let months: number = 0
            if (exam.discounts.length > 0) {
                const aDiscount = exam.discounts[0]
                if (aDiscount.type == 'flat') {
                    price = (Number(exam.subscriptionAmount) - Number(aDiscount.value)) * aDiscount.month
                }
                if (aDiscount.type == 'percent') {
                    const examPrice = Number(exam.subscriptionAmount)
                    const priceDiscount = examPrice * (Number(aDiscount.value) / 100)
                    price = (examPrice - priceDiscount) * aDiscount.month
                }
                months = aDiscount.month
            } else {
                price = Number(exam.subscriptionAmount) * params.cartItem.months
                months = params.cartItem.months
            }

            const cart = await this.db.select().from(Carts).where(eq(Carts.userID, params.userID))
            if (cart.length < 1) {
                throw new UnAuthorizedError('try login again')
            }

            const itemExist = await this.db.select().from(CartItems).where(and(eq(CartItems.cartID, cart[0].id as string), eq(CartItems.examID, exam.id as string)))
            if (itemExist.length > 0) {
                await this.db.update(CartItems).set({
                    price: String(price),
                    months: months,
                }).where(eq(CartItems.id, itemExist[0].id as string))
            } else {
                await this.db.insert(CartItems).values({
                    price: String(price),
                    months: months,
                    cartID: cart[0].id,
                    examID: exam.id as string,
                })
            }
        } catch (error) {
            throw error
        }
    }

    async ClearCart(userID: string): Promise<void> {
        try {
            const cart = await this.db.select().from(Carts).where(eq(Carts.userID, userID))
            if (cart.length < 1) {
                throw new UnAuthorizedError('try login again')
            }

            await this.db.delete(CartItems).where(eq(CartItems.cartID, cart[0].id as string))
        } catch (error) {
            throw error
        }
    }

    async GetCart(userID: string): Promise<Cart> {
        try {
            const cart = await this.db.query.Carts.findFirst({
                where: eq(Carts.userID, userID),
                with: {
                    cartItems: {
                        with: {
                            exam: true
                        }
                    }
                }
            })
            if (!cart) {
                throw new UnAuthorizedError('try login again')
            }
            let totalPrice: number = 0
            cart.cartItems.forEach((item) => {
                totalPrice += Number(item.price)
            })
            return {
                id: cart.id as string,
                userID: cart.userID as string,
                totalPrice,
                cartItems: cart.cartItems.map((item): CartItem => {
                    return {
                        id: item.id as string,
                        months: Number(item.months),
                        price: Number(item.price),
                        cartID: item.cartID as string,
                        examID: item.examID as string,
                        exam: {
                            id: item.exam.id as string,
                            name: item.exam.name as string,
                            description: item.exam.description as string,
                            subscriptionAmount: Number(item.exam.subscriptionAmount),
                            imageURL: item.exam.imageURL as string,
                        },
                    }
                })
            }
        } catch (error) {
            throw error
        }
    }

    async RemoveItem(itemID: string, userID: string): Promise<void> {
        try {
            const cart = await this.db.select().from(Carts).where(eq(Carts.userID, userID))
            if (cart.length < 1) {
                throw new UnAuthorizedError('try login again')
            }

            await this.db.delete(CartItems).where(and(eq(CartItems.cartID, cart[0].id as string), eq(CartItems.id, itemID)))
        } catch (error) {
            throw error
        }
    }
}