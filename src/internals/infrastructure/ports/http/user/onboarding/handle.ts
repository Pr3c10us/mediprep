import {Request, Response, Router} from "express";
import {
    authenticateUserSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    userSchema,
    verifyJwtSchema
} from "../../../../../../pkg/validations/user";
import {UserServices} from "../../../../../app/user/user";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {verifyToken} from "../../../../../../pkg/utils/encryption";
import {SuccessResponse, SuccessResponseWithCookies} from "../../../../../../pkg/responses/success";
import {User} from "../../../../../domain/users/user";
import {AuthorizeUser} from "../../../../../../pkg/middleware/authorization";
import {Environment} from "../../../../../../pkg/configs/env";

export class UserOnboardingHandler {
    userServices;
    router;
    environmentVariable

    constructor(userServices: UserServices) {
        this.userServices = userServices;
        this.router = Router();
        this.environmentVariable = new Environment()


        this.router
            .route("/verify")
            .get(
                ValidationMiddleware(verifyJwtSchema, "query"),
                this.verifyAccount
            );
        this.router
            .route("/signup")
            .post(
                ValidationMiddleware(userSchema, "body"),
                this.addUserHandler
            );

        this.router
            .route("/login")
            .post(
                ValidationMiddleware(authenticateUserSchema, "body"),
                this.authenticateUser
            );

        this.router
            .route("/password/forgot")
            .get(
                ValidationMiddleware(forgotPasswordSchema, "body"),
                this.forgottenPassword
            );
        this.router
            .route("/password/reset")
            .patch(
                AuthorizeUser(userServices.userRepository),
                ValidationMiddleware(resetPasswordSchema, "body"),
                this.resetPassword
            );

    }

    addUserHandler = async (req: Request, res: Response) => {
        const user = req.body as User;
        await this.userServices.commands.addUser.Handle(user)

        new SuccessResponse(res, {message: "account created"}).send();
    };

    verifyAccount = async (req: Request, res: Response) => {
        const payload = verifyToken(req.query.jwt as string);
        const userId = (payload as { id: string }).id;

        await this.userServices.queries.verifyAccount.Handle(userId)
        console.log({vu: this.environmentVariable.verificationURL})
        res.status(302).redirect(this.environmentVariable.verificationURL)
    }

    authenticateUser = async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const {token, user} = await this.userServices.commands.authenticateUser.Handle(
            email,
            password
        );

        const cookie: Cookie = {
            key: "userToken",
            value: token,
        };
        delete user.password
        new SuccessResponseWithCookies(res, cookie, {jwt: token, user}).send();
    };

    forgottenPassword = async (req: Request, res: Response) => {
        const email = req.body.email

        await this.userServices.queries.sendJWT.Handle(email)
        new SuccessResponse(res, {message: "check mail for reset token"}).send()
    }

    resetPassword = async (req: Request, res: Response) => {
        const {newPassword, oldPassword} = req.body
        await this.userServices.commands.resetPassword.Handle(req.userD?.id as string, newPassword, oldPassword)
        new SuccessResponse(res, {message: "password reset"}).send()

    }


}
