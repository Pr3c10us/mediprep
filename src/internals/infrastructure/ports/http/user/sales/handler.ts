import { SalesServices } from "../../../../../app/sale/sale";
import { Request, Response, Router } from "express";
import CheckPermission from "../../../../../../pkg/middleware/checkPermission";
import ValidationMiddleware from "../../../../../../pkg/middleware/validation";
import { getSalesFilterSchema, saleIdSchema } from "../../../../../../pkg/validations/sales";
import { PaginationFilter } from "../../../../../../pkg/types/pagination";
import { SuccessResponse } from "../../../../../../pkg/responses/success";
import { UnAuthorizedError } from "../../../../../../pkg/errors/customError";

export class SalesHandler {
    services;
    router;

    constructor(services: SalesServices) {
        this.services = services;
        this.router = Router();

        this.router
            .route("/").get(
                CheckPermission("read_sales"),
                ValidationMiddleware(getSalesFilterSchema, "query"),
                this.getSales
            )

        this.router
            .route("/:id").get(
                CheckPermission("read_sales"),
                ValidationMiddleware(saleIdSchema, "params"),
                this.getSaleByID
            )

    }

    getSales = async (req: Request, res: Response) => {
        const userID = req.userD?.id
        if (!userID) {
            throw new UnAuthorizedError("try login again")
        }
        const { limit, page, reference } = req.query
        const filter: PaginationFilter = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            reference: reference as string | undefined,
            userId: userID
        };

        const { sales, metadata } = await this.services.queries.getSales.handle(filter)

        new SuccessResponse(res, { sales }, metadata).send();
    };

    getSaleByID = async (req: Request, res: Response) => {
        const { id } = req.params

        const sale = await this.services.queries.getSaleByID.handle(id)

        new SuccessResponse(res, { ...sale }).send();
    };
}
