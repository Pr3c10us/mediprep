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
} from "../../../../../pkg/validations/admin";
import { Admin } from "../../../../domain/admins/admin";
import CheckPermission from "../../../../../pkg/middleware/checkPermission";
import AuthorizeAdmin from "../../../../../pkg/middleware/authorization";
import { date } from "zod";

export class AdminHandler {
    services: AdminServices;
    router: Router;

    constructor(services: AdminServices) {
        this.services = services;
        this.router = Router();

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
        const password = await this.services.Commands.addAdmin.Handle(admin);

        new SuccessResponse(res, { password }, null).send();
    };

    authenticateAdmin = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const token = await this.services.Commands.authenticateAdmin.Handle(
            email,
            password
        );

        const cookie: Cookie = {
            key: "adminToken",
            value: token,
        };
        new SuccessResponseWithCookies(res, cookie, { jwt: token }).send();
    };
}
