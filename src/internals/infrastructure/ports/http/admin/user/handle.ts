import {Request, Response, Router} from "express";
import {UserServices} from "../../../../../app/user/user";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {SuccessResponse} from "../../../../../../pkg/responses/success";
import {AuthorizeAdmin} from "../../../../../../pkg/middleware/authorization";
import {AdminServices} from "../../../../../app/admin/admin";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import {getCommandFilterSchema} from "../../../../../../pkg/validations/exam";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";
import {z} from "zod";
import {uuidSchema} from "../../../../../../pkg/validations/admin";

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

        this.router
            .route("/:userId")
            .get(
                AuthorizeAdmin(adminServices.adminRepository),
                CheckPermission("read_user"),
                ValidationMiddleware(z.object({userId: uuidSchema}), "params"),
                this.getUserDetailsHandler
            );

        this.router
            .route("/:userId/blacklist")
            .patch(
                AuthorizeAdmin(adminServices.adminRepository),
                CheckPermission("edit_user"),
                ValidationMiddleware(z.object({userId: uuidSchema}), "params"),
                ValidationMiddleware(z.object({blacklist: z.boolean()}), "body"),
                this.blacklistUserHandler
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

    getUserDetailsHandler = async (req: Request, res: Response) => {
        const user = await this.userServices.queries.getUserDetails.handle(req.params.userId);

        new SuccessResponse(res, {user}).send();
    }

    blacklistUserHandler = async (req: Request, res: Response) => {
        const user = await this.userServices.commands.updateUser.Handle({
            id: req.params.userId,
            blacklisted: req.body.blacklist
        });
        new SuccessResponse(res, {user}).send();
    }
}
