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

export class UserHandler {
    userServices;
    router;

    constructor(userServices: UserServices, adminServices: AdminServices) {
        this.userServices = userServices;
        this.router = Router();

        this.router
            .route("/")
            .get(
                AuthorizeAdmin(adminServices.adminRepository),
                CheckPermission("read_user"),
                ValidationMiddleware(getCommandFilterSchema, "query"),
                this.getUsersHandler
            );
    }

    getUsersHandler = async (req: Request, res: Response) => {
        const {
            limit,
            page,
            firstName,
            lastName,
            email,
            profession,
            country,
            startDate,
            endDate
        } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            firstName: firstName as string | undefined,
            lastName: lastName as string | undefined,
            email: email as string | undefined,
            profession: profession as string | undefined,
            country: country as string | undefined,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
        };

        const {users, metadata} = await this.userServices.queries.getUsers.handle(filter);

        new SuccessResponse(res, {users: users}, metadata).send();
    }
}
