import {Request, Response, Router} from "express";
import {userIdSchema, userSchema, verifyJwtSchema} from "../../../../../pkg/validations/user";
import {UserServices} from "../../../../app/user/user";
import ValidationMiddleware from "../../../../../pkg/middleware/validation";
import {verifyToken} from "../../../../../pkg/utils/encryption";
import {SuccessResponse} from "../../../../../pkg/responses/success";
import AuthorizeAdmin from "../../../../../pkg/middleware/authorization";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import {addAdminSchema} from "../../../../../pkg/validations/admin";
import {Admin} from "../../../../domain/admins/admin";
import {User} from "../../../../domain/users/user";

export class UserHandler {
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

    }

    addUserHandler = async (req: Request, res: Response) => {
        const user = req.body as User;
        await this.userServices.commands.addUser.Handle(user)

        new SuccessResponse(res, { message: "account created" }).send();
    };

    verifyAccount = async (req: Request, res: Response) => {
        const payload = verifyToken(req.query.jwt as string);
        const userId = (payload as { id: string }).id;

        await this.userServices.queries.verifyAccount.Handle(userId)

        new SuccessResponse(res, { msg: "Account verified" }).send();
    }




}
