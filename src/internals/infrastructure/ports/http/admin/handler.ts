import { Request, Response, Router } from "express";
import { AdminServices } from "../../../../app/admin/admin";
import {
    SuccessResponse,
    SuccessResponseWithCookies,
} from "../../../../../pkg/responses/success";
import ValidationMiddleware from "../../../../../pkg/middleware/validation";
import {
    addAdminSchema,
    authenticateAdminSchema,
    getAdminsFilterSchema,
} from "../../../../../pkg/validations/admin";
import { Admin } from "../../../../domain/admins/admin";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import {AuthorizeAdmin} from "../../../../../pkg/middleware/authorization";
import { PaginationFilter } from "../../../../../pkg/types/pagination";

export class AdminHandler {
    services;
    router;

    constructor(services: AdminServices) {
        this.services = services;
        this.router = Router();

        this.router
            .route("/")
            .get(
                AuthorizeAdmin(this.services.adminRepository),
                CheckPermission("read_admin"),
                ValidationMiddleware(getAdminsFilterSchema, "query"),
                this.getAdmins
            );

        this.router
            .route("/add")
            .post(
                AuthorizeAdmin(this.services.adminRepository),
                CheckPermission("create_admin"),
                ValidationMiddleware(addAdminSchema, "body"),
                this.addAdminHandler
            );

        this.router
            .route("/authenticate")
            .post(
                ValidationMiddleware(authenticateAdminSchema, "body"),
                this.authenticateAdmin
            );
    }

    addAdminHandler = async (req: Request, res: Response) => {
        const admin = req.body as Admin;
        const password = await this.services.commands.addAdmin.Handle(admin);

        new SuccessResponse(res, { password }, null).send();
    };

    authenticateAdmin = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const token = await this.services.commands.authenticateAdmin.Handle(
            email,
            password
        );

        const cookie: Cookie = {
            key: "adminToken",
            value: token,
        };
        new SuccessResponseWithCookies(res, cookie, { jwt: token }).send();
    };

    getAdmins = async (req: Request, res: Response) => {
        const { limit, page, name, email } = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            email:email as string | undefined
        };

        const {admins,metadata} = await this.services.queries.getAdmins.handle(filter);

        new SuccessResponse(res, { admins },metadata).send();
    };
}
