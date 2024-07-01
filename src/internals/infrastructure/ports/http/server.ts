import express, {Express, Request, Response, Router} from "express";
import {Services} from "../../../app/services";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import {SuccessResponse} from "../../../../pkg/responses/success";
import Logger from "../../../../pkg/utils/logger";
import morganMiddleware from "../../../../pkg/middleware/morgan";
import {Environment} from "../../../../pkg/configs/env";
import ErrorHandlerMiddleware from "../../../../pkg/middleware/errorHandler";
import Route404 from "../../../../pkg/middleware/route404";
import {WebhookHandler} from "./webhook/handler";
import AdminRouter from "./admin/router";
import UserRouter from "./user/router";

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
        this.webhook();
        this.user();
        this.admin();

        this.server.use(`/api/${environmentVariables.apiVersion}`, this.apiRouter);

        this.server.use(Route404);
        this.server.use(ErrorHandlerMiddleware);
    }

    health = () => {
        this.server.get("/health", (_: Request, res: Response) => {
            new SuccessResponse(res).send();
        });
    };

    webhook = () => {
        const router = new WebhookHandler(this.services.SalesServices, this.environmentVariables);
        this.apiRouter.use("/webhook", router.router);
    };

    user = () => {
        const router = new UserRouter(this.services);
        this.apiRouter.use("/user", router.router);
    };

    admin = () => {
        const router = new AdminRouter(this.services);
        this.apiRouter.use("/admin", router.router);
    };

    listen = () => {
        this.server.listen(this.port, () => {
            Logger.info(`Server running on ${this.environmentVariables.url}`);
        });
    };
}
