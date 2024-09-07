import pg from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import {Admins} from "../schema/admins";
import {encrypt} from "../../../src/pkg/utils/encryption";
import {Environment} from "../../../src/pkg/configs/env";

export const adminSeed = async (pgClient: pg.PoolClient, env: Environment) => {
    try {
        const db = drizzle(pgClient);
        const password = await encrypt(env.adminPassword)
        await db.insert(Admins).values({
            name: env.adminName,
            email: env.adminEmail,
            password: password,
            roles: ["admin"],
        })
        console.log("Admin Seed done");
    }catch (error) {
        console.log("Admin Seed not done");
    }
}