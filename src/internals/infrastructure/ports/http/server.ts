import express, {Express, Request, Response, Router} from "express";
import {Services} from "../../../app/services";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import {SuccessResponse} from "../../../../pkg/responses/success";
import Logger from "../../../../pkg/utils/logger";
import morganMiddleware from "../../../../pkg/middleware/morgan";
import {Environment} from "../../../../pkg/configs/env";
import {AdminHandler} from "./admin/handler";
import ErrorHandlerMiddleware from "../../../../pkg/middleware/errorHandler";
import Route404 from "../../../../pkg/middleware/route404";
import {ExamHandler} from "./exam/handler";
import {AuthorizeAdmin} from "../../../../pkg/middleware/authorization";
import {UserHandler} from "./user/handle";

export class Server {
    services: Services;
    environmentVariables: Environment;
    port: number;
    server: Express;
    apiRouter: Router;

    constructor(services: Services, environmentVariables: Environment) {
        this.services = services;
        this.environmentVariables = environmentVariables;
        this.port = environmentVariables.port;
        this.server = express();
        this.apiRouter = express.Router();

        this.server.use(express.json());
        this.server.use(express.urlencoded({extended: false}));
        this.server.use(helmet());
        this.server.use(cookieParser(environmentVariables.cookieSecret));
        this.server.use(morganMiddleware);
        this.server.use(
            cors({
                origin: environmentVariables.clientOrigin,
                credentials: true,
            })
        );

        this.health();
        this.admin();
        this.user();
        this.exam();

        this.server.use(`/api/${environmentVariables.apiVersion}`, this.apiRouter);

        this.server.use(Route404);
        this.server.use(ErrorHandlerMiddleware);
    }

    health = () => {
        this.server.get("/health", (req: Request, res: Response) => {
            new SuccessResponse(res).send();
        });
    };

    admin = () => {
        const router = new AdminHandler(this.services.AdminServices);
        this.apiRouter.use("/admin", router.router);
    };

    user = () => {
        const router = new UserHandler(this.services.UserServices);
        this.apiRouter.use("/user", router.router);
    };

    exam = () => {
        const router = new ExamHandler(this.services.ExamServices, this.services.AdminServices);
        this.apiRouter.use("/exam", AuthorizeAdmin(this.services.AdminServices.adminRepository), router.router);
    };

    listen = () => {
        this.server.listen(this.port, () => {
            Logger.info(`Server running on ${this.environmentVariables.url}`);
        });
    };
}
