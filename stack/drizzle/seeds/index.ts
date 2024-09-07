import pg, {Pool} from "pg";
import {Environment} from "../../../src/pkg/configs/env";
import {adminSeed} from "./admin";

const getDBClient = (
    environmentVariables: Environment
): Pool => {
    const {Pool} = pg;
    return new Pool({
        user: environmentVariables.pgDBUsername,
        password: environmentVariables.pgDBPassword,
        host: environmentVariables.pgDBHost,
        port: environmentVariables.pgDBPort,
        database: environmentVariables.pgDBDatabase,
    })
};

const main = async () => {
    const environmentVariables = new Environment();
    const dbClient = await getDBClient(environmentVariables).connect();

    await adminSeed(dbClient, environmentVariables)
}
main().then(r => {
});