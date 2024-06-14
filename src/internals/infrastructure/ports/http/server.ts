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

export class Server {
    services: Services;
    environmentVariables: Environment;
    port: number;
    server: Express;
    apiV1Router: Router;

    constructor(services: Services, environmentVariables: Environment) {
        this.services = services;
        this.environmentVariables = environmentVariables;
        this.port = environmentVariables.port;
        this.server = express();
        this.apiV1Router = express.Router();

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
        this.exam();

        this.server.use("/api/v1", this.apiV1Router);

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
        this.apiV1Router.use("/admin", router.router);
    };

    exam = () => {
        const router = new ExamHandler(this.services.ExamServices, this.services.AdminServices);
        this.apiV1Router.use("/exam", router.router);
    };

    listen = () => {
        this.server.listen(this.port, () => {
            Logger.info(`Server running on ${this.environmentVariables.url}`);
        });
    };
}
