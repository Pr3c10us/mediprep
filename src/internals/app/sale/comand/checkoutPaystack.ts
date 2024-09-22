import {UserExamAccessRepository} from "../../../domain/sales/repository";
import {UserRepository} from "../../../domain/users/repository";
import {Paystack} from "paystack-sdk";
import {InitializeTransaction} from "paystack-sdk/dist/transaction/interface";
import {CartRepository} from "../../../domain/carts/repository";
import {AddSaleParams} from "../../../domain/sales/sale";
import {UnAuthorizedError} from "../../../../pkg/errors/customError";

export interface CheckoutPaystack {
    Handle: (params: {
        userID: string,
    }) => Promise<{ accessCode: string, authorizationURL: string }>
}

export class CheckoutPaystackC implements CheckoutPaystack {
    salesRepository: UserExamAccessRepository
    userRepository: UserRepository
    cartRepository: CartRepository
    paystackClient: Paystack

    constructor(salesRepository: UserExamAccessRepository, userRepository: UserRepository, cartRepository: CartRepository, paystackClient: Paystack) {
        this.salesRepository = salesRepository
        this.userRepository = userRepository
        this.cartRepository = cartRepository
        this.paystackClient = paystackClient
    }

    Handle = async (params: {
        userID: string,
    }): Promise<{ accessCode: string, authorizationURL: string }> => {
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
                amount: (Math.round(totalPrice * 100)).toString(),
                email: user.email,
                // currency:"usd"
            }
            // clear cart
            await this.cartRepository.ClearCart(params.userID)

            // initialize paystack transaction
            const response = await this.paystackClient.transaction.initialize(transactionInitializer).catch(async (error) => {
                await this.salesRepository.UpdateSale({userId: params.userID, id: saleID, status: "failed"})
                throw error
            })
            if (!response.data?.reference || !response.data.access_code) {
                await this.salesRepository.UpdateSale({userId: params.userID, id: saleID, status: "failed"})
                throw new Error("Failed to Process transaction")
            }

            // add reference nad access code to sale
            await this.salesRepository.UpdateSale({
                userId: params.userID,
                id: saleID,
                reference: response.data.reference,
                accessCode: response.data.access_code,
                paymentGateway: "paystack"
            }).catch(async (error) => {
                await this.salesRepository.UpdateSale({userId: params.userID, id: saleID, status: "failed"})
                throw error
            })

            // return access code
            return {accessCode: response.data.access_code, authorizationURL: response.data.authorization_url}
        } catch (error) {
            throw error;
        }
    }

}