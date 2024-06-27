import {SalesServices} from "../../../../app/sale/sale";
import {Request, Response, Router} from "express";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import {Environment} from "../../../../../pkg/configs/env";
import * as crypto from "node:crypto";
import {Sale} from "../../../../domain/sales/sale";

export class WebhookHandler {
    services;
    router;
    environmentVariable: Environment

    constructor(services: SalesServices, environmentVariable: Environment) {
        this.services = services;
        this.router = Router();
        this.environmentVariable = environmentVariable

        this.router
            .route("/paystack").post(this.paystack)
    }

    paystack = async (req: Request, res: Response) => {
        const hash = crypto.createHmac('sha512', this.environmentVariable.paystackSecret).update(JSON.stringify(req.body)).digest('hex');
        if (hash != req.headers['x-paystack-signature']) {
            return new SuccessResponse(res, {message: "nice one thief"}).send()
        }
        if (req.body.event != "charge.success") {
            return new SuccessResponse(res).send();
        }
        const {amount, reference, customer,status, metadata} = req.body.data
        const sale: Sale = {
            userId: metadata.userId,
            examId:metadata.examId,
            reference: reference,
            amount: amount/100,
            email: customer.email,
            status,
        }
        try {
            await this.services.commands.subscribe.Handle(sale)
            new SuccessResponse(res).send();
        } catch (error) {
            console.log(error)
            new SuccessResponse(res).send();
        }
    };
}
