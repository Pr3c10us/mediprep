// drizzle.config.ts
import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";
loadEnv();

export default {
    schema: "./stack/drizzle/schema",
    out: "./stack/drizzle/migrations",
    dialect: "postgresql",
    // driver: "pg",
    dbCredentials: {
        host: process.env.PG_DB_HOST,
        port: process.env.PG_DB_PORT,
        user: process.env.PG_DB_USERNAME,
        password: process.env.PG_DB_PASSWORD,
        database: process.env.PG_DB_NAME,
        ssl: process.env.PG_SSL_MODE === 'true',
    },
    verbose: true,
    strict: true,
} as Config ;