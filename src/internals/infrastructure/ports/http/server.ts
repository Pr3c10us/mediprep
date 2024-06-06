import express, { Express, Request, Response } from "express";
import { Services } from "../../../app/services";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { SuccessResponse } from "../../../../pkg/response/success";
import { write } from "fs";
import Logger from "../../../../pkg/utils/logger";
import morganMiddleware from "../../../../pkg/middleware/morgan";
import { Environment } from "../../../../pkg/configs/env";

export class Server {
    services: Services;
    environmentVariables: Environment;
    server: Express;
    port: number;

    constructor(services: Services, environmentVariables: Environment) {
        this.services = services;
        this.environmentVariables = environmentVariables;
        this.server = express();
        this.port = environmentVariables.port;

        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: false }));
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
    }

    health = () => {
        this.server.get("/health", (req: Request, res: Response) => {
            new SuccessResponse().send(res);
        });
    };

    listen = () => {
        this.server.listen(this.port, () => {
            Logger.info(`Server running on ${this.environmentVariables.url}`);
        });
    };
}
