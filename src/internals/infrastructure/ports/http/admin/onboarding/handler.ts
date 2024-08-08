import {Request, Response, Router} from "express";
import {AdminServices} from "../../../../../app/admin/admin";
import {SuccessResponse, SuccessResponseWithCookies,} from "../../../../../../pkg/responses/success";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import {
    addAdminSchema,
    authenticateAdminSchema, changeAdminPasswordSchema,
    getAdminsFilterSchema,
    removeAdminSchema,
    updateAdminSchema,
} from "../../../../../../pkg/validations/admin";
import {Admin} from "../../../../../domain/admins/admin";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import {AuthorizeAdmin} from "../../../../../../pkg/middleware/authorization";
import {PaginationFilter} from "../../../../../../pkg/types/pagination";

export class AdminOnboardingHandler {
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
            ).patch(
            AuthorizeAdmin(this.services.adminRepository),
            ValidationMiddleware(updateAdminSchema, "body"),
            this.updateAdmin
        );

        this.router
            .route("/password")
            .patch(
            AuthorizeAdmin(this.services.adminRepository),
            ValidationMiddleware(changeAdminPasswordSchema, "body"),
            this.changePassword
        );

        this.router
            .route("/:id")
            .delete(
                AuthorizeAdmin(this.services.adminRepository),
                CheckPermission("delete_admin"),
                ValidationMiddleware(removeAdminSchema, "params"),
                this.removeAdmin
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

        new SuccessResponse(res, {password}, null).send();
    };

    authenticateAdmin = async (req: Request, res: Response) => {
        const {email, password} = req.body;

        const token = await this.services.commands.authenticateAdmin.Handle(
            email,
            password
        );

        const cookie: Cookie = {
            key: "adminToken",
            value: token,
        };
        new SuccessResponseWithCookies(res, cookie, {jwt: token}).send();
    };

    getAdmins = async (req: Request, res: Response) => {
        const {limit, page, name, email} = req.query;
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            name: name as string | undefined,
            email: email as string | undefined
        };

        const {admins, metadata} = await this.services.queries.getAdmins.handle(filter);

        new SuccessResponse(res, {admins}, metadata).send();
    };

    removeAdmin = async (req: Request, res: Response) => {
        const {id} = req.params
        await this.services.commands.removeAdmin.Handle(id)
        new SuccessResponse(res, {message: "admin deleted"}).send();
    }

    updateAdmin = async (req: Request, res: Response) => {
        const {email, name} = req.body
        const admin: Partial<Admin> = {
            name, email, id: req.admin?.id
        }
        await this.services.commands.updateAdmin.Handle(admin)
        new SuccessResponse(res, {message: "admin updated"}).send();
    }

    changePassword = async (req: Request, res: Response) => {
        const {oldPassword, newPassword} = req.body
        await this.services.commands.changePassword.Handle(req.admin?.id as string, oldPassword, newPassword)
        new SuccessResponse(res, {message: "password changed"}).send();
    }
}
