import { Services } from "./internals/app/services";
import { Adapter } from "./internals/infrastructure/adapters/adapters";
import { Server } from "./internals/infrastructure/ports/http/server";
import path from "path";
import pg from "pg";
import { Environment } from "./pkg/configs/env";

const main = async () => {
    const environmentVariables = new Environment();

    const { Pool } = pg;
    const pool = new Pool({
        user: environmentVariables.pgDBUsername,
        password: environmentVariables.pgDBPassword,
        host: environmentVariables.pgDBHost,
        port: environmentVariables.pgDBPort,
        database: environmentVariables.pgDBDatabase,
    });
    const client = await pool.connect();

    const adapter: Adapter = new Adapter(client);
    const services: Services = new Services(adapter);
    const httpServer: Server = new Server(services, environmentVariables);

    httpServer.listen();
};

main();
