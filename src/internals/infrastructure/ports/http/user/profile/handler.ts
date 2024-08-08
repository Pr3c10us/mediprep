import {Request, Response, Router} from "express";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {updateUserSchema, userSchema} from "../../../../../../pkg/validations/user";
import {UserServices} from "../../../../../app/user/user";
import {User} from "../../../../../domain/users/user";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {AuthorizeUser} from "../../../../../../pkg/middleware/authorization";
import {BadRequestError} from "../../../../../../pkg/errors/customError";

export class UserProfileHandler {
    userServices;
    router;

    constructor(userServices: UserServices) {
        this.userServices = userServices;
        this.router = Router();

        this.router
            .route("/update")
            .patch(
                ValidationMiddleware(updateUserSchema, "body"),
                AuthorizeUser(userServices.userRepository),
                this.updateUserHandler
            );

        this.router
            .route("/")
            .get(
                AuthorizeUser(userServices.userRepository),
                this.getUserDetails
            );

    }


    updateUserHandler = async (req: Request, res: Response) => {
        const user = req.body as Partial<User>;
        if (user.password) {
            throw new BadRequestError("password can't be updated here")
        }
        user.id = req.userD?.id
        await this.userServices.commands.updateUser.Handle(user)

        new SuccessResponse(res, {message: "account updated"}).send();
    };

    getUserDetails = async (req: Request, res: Response) => {
        new SuccessResponse(res, {user: req.userD}).send();
    }

}
