import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {AuthorizeUser} from "../../../../../../pkg/middleware/authorization";
import {EmailServices} from "../../../../../app/email/email";
import {z} from "zod";
import {Email} from "../../../../../domain/notification/email";
import {UserServices} from "../../../../../app/user/user";
import {Environment} from "../../../../../../pkg/configs/env";

export class UserSupportHandler {
    emailService;
    userServices
    router;
    environmentVariables;

    constructor(emailService: EmailServices, userServices: UserServices, environmentVariables: Environment) {
        this.emailService = emailService;
        this.userServices = userServices;
        this.router = Router();
        this.environmentVariables = environmentVariables
        this.router
            .route("/")
            .post(
                ValidationMiddleware(z.object({
                    message: z.string()
                }), "body"),
                this.updateUserHandler
            );


    }


    updateUserHandler = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        const user = await this.userServices.queries.getUserDetails.handle(userID as string)
        const emailParams: Email = {
            mailTo: ["owo.pre.eno@gmail.com"],
            subject: `support request from : ${user.email}`,
            plainText: req.body.message,
        }
        await this.emailService.Commands.sendMail.Handle(emailParams)

        new SuccessResponse(res, {message: "message sent"}).send();
    };
}
