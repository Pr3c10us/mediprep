import {AddSaleParams} from "../../../domain/sales/sale";
import {UserExamAccessRepository} from "../../../domain/sales/repository";
import {UserRepository} from "../../../domain/users/repository";
import {InitializeTransaction} from "paystack-sdk/dist/transaction/interface";
import {CartRepository} from "../../../domain/carts/repository";
import Stripe from "stripe";
import {UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface CheckoutStripe {
    Handle: (params: {
        userID: string,
    }) => Promise<string>
}

export class CheckoutStripeC implements CheckoutStripe {
    salesRepository: UserExamAccessRepository
    userRepository: UserRepository
    cartRepository: CartRepository
    stripeClient: Stripe

    constructor(salesRepository: UserExamAccessRepository, userRepository: UserRepository, cartRepository: CartRepository, stripeClient: Stripe) {
        this.salesRepository = salesRepository
        this.userRepository = userRepository
        this.cartRepository = cartRepository
        this.stripeClient = stripeClient
    }

    Handle = async (params: {
        userID: string,
    }): Promise<string> => {
        try {
            const user = await this.userRepository.getUserDetails(params.userID)
            if (!user.id) {
                throw new UnAuthorizedError("try to login")
            }
            const cart = await this.cartRepository.GetCart(params.userID)
            const addParams: AddSaleParams = {
                userID: user.id,
                cartID: cart.id,
                email: user.email
            }
            const {totalPrice, saleID} = await this.salesRepository.AddSale(addParams)
            const transactionInitializer: InitializeTransaction = {
                amount: (totalPrice * 100).toString(),
                email: user.email
            }
            // clear cart
            await this.cartRepository.ClearCart(params.userID)

            // initialize paystack transaction
            const paymentIntent = await this.stripeClient.paymentIntents.create({
                amount: (totalPrice * 100),
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
            })
            if (!paymentIntent.client_secret) {
                await this.salesRepository.UpdateSale({userId: params.userID, id: saleID, status: "failed"})
                throw new Error("Failed to Process transaction")
            }

            // add reference nad access code to sale
            await this.salesRepository.UpdateSale({
                userId: params.userID,
                id: saleID,
                reference: paymentIntent.client_secret,
                paymentGateway: "stripe"
            }).catch(async (error) => {
                await this.salesRepository.UpdateSale({userId: params.userID, id: saleID, status: "failed"})
                throw error
            })

            return paymentIntent.client_secret
        } catch (error) {
            throw error;
        }
    }

}