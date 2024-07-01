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
import {AuthorizeAdmin, AuthorizeUser} from "../../../../../../pkg/middleware/authorization";
import {AdminServices} from "../../../../../app/admin/admin";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import {getCommandFilterSchema} from "../../../../../../pkg/validations/exam";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";

export class UserOnboardingHandler {
    userServices;
    router;

    constructor(userServices: UserServices) {
        this.userServices = userServices;
        this.router = Router();

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

        new SuccessResponse(res, {msg: "Account verified"}).send();
    }

    authenticateUser = async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const token = await this.userServices.commands.authenticateUser.Handle(
            email,
            password
        );

        const cookie: Cookie = {
            key: "userToken",
            value: token,
        };
        new SuccessResponseWithCookies(res, cookie, {jwt: token}).send();
    };

    forgottenPassword = async (req: Request, res: Response) => {
        const email = req.body.email

        await this.userServices.queries.sendJWT.Handle(email)
        new SuccessResponse(res, {message: "check mail for reset token"}).send()
    }

    resetPassword = async (req: Request, res: Response) => {
        const {newPassword, oldPassword} = req.body
        await this.userServices.commands.resetPassword.Handle(req.user?.id as string, newPassword, oldPassword)
        new SuccessResponse(res, {message: "password reset"}).send()

    }
}
