import {SalesServices} from "../../../../app/sale/sale";
import {Request, Response, Router} from "express";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import {Environment} from "../../../../../pkg/configs/env";
import * as crypto from "node:crypto";
import {Sale} from "../../../../domain/sales/sale";
import Stripe from "stripe";
import {UnAuthorizedError} from "../../../../../pkg/errors/customError";

export class WebhookHandler {
    services;
    router;
    environmentVariable: Environment
    stripeClient: Stripe

    constructor(services: SalesServices, environmentVariable: Environment, stripeClient: Stripe) {
        this.services = services;
        this.router = Router();
        this.environmentVariable = environmentVariable
        this.stripeClient = stripeClient

        this.router
            .route("/paystack").post(this.paystack)
        this.router
            .route("/stripe").post(this.stripe)
    }

    paystack = async (req: Request, res: Response) => {
        const hash = crypto.createHmac('sha512', this.environmentVariable.paystackSecret).update(JSON.stringify(req.body)).digest('hex');
        if (hash != req.headers['x-paystack-signature']) {
            return new SuccessResponse(res, {message: "nice one thief"}).send()
        }
        if (req.body.event != "charge.success") {
            return new SuccessResponse(res).send();
        }
        const {amount, reference, customer, status, metadata} = req.body.data
        const sale: Partial<Sale> = {
            userId: metadata.userId,
            reference: reference,
            amount: amount / 100,
            email: customer.email,
            status,
        }
        try {
            await this.services.commands.examSubscribe.Handle(reference)
            new SuccessResponse(res).send();
        } catch (error) {
            console.log(error)
            new SuccessResponse(res).send();
        }
    };
    stripe = async (req: Request, res: Response) => {
        const sig = req.headers["stripe-signature"];
        if (!sig) {
            throw new UnAuthorizedError("nice one thief")
        }

        let event;
        try {
            event = this.stripeClient.webhooks.constructEvent(
                req.body,
                sig,
                this.environmentVariable.stripeSigningSecret
            );
        } catch (err) {
            console.log(err);
            res.status(400).send(`Webhook Error`);
            return;
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                // Then define and call a method to handle the successful payment intent.
                // handlePaymentIntentSucceeded(paymentIntent);
                await this.services.commands.examSubscribe.Handle(paymentIntent.client_secret as string)
                break;
            case 'payment_method.attached':
                const paymentMethod = event.data.object;
                // Then define and call a method to handle the successful attachment of a PaymentMethod.
                // handlePaymentMethodAttached(paymentMethod);
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        new SuccessResponse(res).send();
    };
}
