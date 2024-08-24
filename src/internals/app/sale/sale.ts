import {UserExamAccessRepository} from "../../domain/sales/repository";
import {UserRepository} from "../../domain/users/repository";
import {CheckoutPaystack, CheckoutPaystackC} from "./comand/checkoutPaystack";
import {GetSalesQuery, GetSalesQueryC} from "./query/getSales";
import {GetSaleByIDQuery, GetSaleByIDQueryC} from "./query/getSaleById";
import {Paystack} from "paystack-sdk";
import {CartRepository} from "../../domain/carts/repository";
import {CheckoutStripe, CheckoutStripeC} from "./comand/checkoutStripe";
import Stripe from "stripe";
import {ExamSubscribe, ExamSubscribeC} from "./comand/examSubscription";

export class Commands {
    checkoutPaystack: CheckoutPaystack
    checkoutStripe: CheckoutStripe
    examSubscribe: ExamSubscribe

    constructor(
        salesRepository: UserExamAccessRepository, userRepository: UserRepository, cartRepository: CartRepository, paystackClient: Paystack, stripeClient: Stripe
    ) {
        this.checkoutPaystack = new CheckoutPaystackC(salesRepository, userRepository, cartRepository, paystackClient)
        this.checkoutStripe = new CheckoutStripeC(salesRepository, userRepository, cartRepository, stripeClient)
        this.examSubscribe = new ExamSubscribeC(salesRepository, userRepository)
    }
}

export class Queries {
    getSales: GetSalesQuery
    getSaleByID: GetSaleByIDQuery

    constructor(salesRepository: UserExamAccessRepository
    ) {
        this.getSales = new GetSalesQueryC(salesRepository)
        this.getSaleByID = new GetSaleByIDQueryC(salesRepository)
    }
}

export class SalesServices {
    commands: Commands;
    queries: Queries;
    salesRepository: UserExamAccessRepository;

    constructor(
        salesRepository: UserExamAccessRepository, userRepository: UserRepository, cartRepository: CartRepository, paystackClient: Paystack, stripeClient: Stripe
    ) {
        this.salesRepository = salesRepository;
        this.commands = new Commands(salesRepository, userRepository, cartRepository, paystackClient, stripeClient);
        this.queries = new Queries(salesRepository);
    }
}
