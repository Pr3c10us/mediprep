import dotenv from "dotenv";
dotenv.config();

export class Environment {
    pgDBUsername: string;
    pgDBPassword: string;
    pgDBHost: string;
    pgDBPort: number;
    pgDBDatabase: string;

    cookieSecret: string;
    cookieExpires: number;

    jwtSecret: string;
    jwtExpires: string;

    nodeENV: string;
    port: number;
    url: string;
    apiVersion: string

    clientOrigin: string[];

    azSessionId : string;
    azClientId: string;
    azClientSecret: string;
    azTenantId: string;

    azCommunicationConnectionString: string;
    azCommunicationMailFrom: string;

    azAccountStorageName: string;
    azExamContainerName: string;

    kafkaClientId: string;
    kafkaBroker: string[];
    kafkaEmailGroupID: string;
    kafkaEmailTopic: string;

    resetPasswordURL: string;
    constructor() {
        this.pgDBUsername = this.getEnvAsString("PG_DB_USERNAME", "postgres");
        this.pgDBPassword = this.getEnvAsString("PG_DB_PASSWORD", "password");
        this.pgDBHost = this.getEnvAsString("PG_DB_HOST", "127.0.0.1");
        this.pgDBPort = this.getEnvAsInt("PG_DB_PORT", 5432);
        this.pgDBDatabase = this.getEnvORError("PG_DB_NAME");

        this.cookieSecret = this.getEnvORError("COOKIE_SECRET");
        this.cookieExpires = this.getEnvAsInt(
            "COOKIE_EXPIRES",
            1000 * 60 * 60 * 24 * 7
        );

        this.jwtSecret = this.getEnvORError("JWT_SECRET");
        this.jwtExpires = this.getEnvAsString("JWT_EXPIRES", "7d");

        this.nodeENV = this.getEnvAsString("NODE_ENV", "development");
        this.port = this.getEnvAsInt("PORT", 5000);
        this.url = this.getEnvAsString("URL", "http://localhost:5000");
        this.apiVersion = this.getEnvAsString("API_VERSION", "v1");

        this.clientOrigin = [this.getEnvORError("CLIENT_ORIGIN_1")];

        this.azSessionId= this.getEnvORError("AZURE_SESSION_ID");
        this.azClientId= this.getEnvORError("AZURE_CLIENT_ID")
        this.azClientSecret= this.getEnvORError("AZURE_CLIENT_SECRET")
        this.azTenantId= this.getEnvORError("AZURE_TENANT_ID")

        this.azCommunicationConnectionString = this.getEnvORError(
            "AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING"
        );
        this.azCommunicationMailFrom = this.getEnvORError(
            "AZURE_COMMUNICATION_SERVICE_MAIL_FROM"
        );

        this.azAccountStorageName = this.getEnvORError(
            "AZURE_STORAGE_ACCOUNT_NAME"
        );
        this.azExamContainerName = this.getEnvORError(
            "AZURE_EXAM_CONTAINER_NAME"
        );

        this.kafkaClientId = this.getEnvORError("KAFKA_CLIENT_ID");
        this.kafkaBroker = [this.getEnvORError("KAFKA_BROKER")];
        this.kafkaEmailGroupID = this.getEnvORError("KAFKA_EMAIL_GROUP_ID");
        this.kafkaEmailTopic = this.getEnvORError("KAFKA_EMAIL_TOPIC");

        this.resetPasswordURL = this.getEnvORError("RESET_PASSWORD_URL");
    }

    getEnvORError = (key: string): string => {
        const value: string = String(process.env[key]);
        if (value) {
            return value;
        }
        console.log("Environment variable not set");
        process.exit(0);
    };

    getEnvAsString = (key: string, fallback: string): string => {
        const value: string = String(process.env[key]);
        if (value) {
            return value;
        }
        return fallback;
    };

    getEnvAsInt = (key: string, fallback: number): number => {
        const value: number = Number(process.env[key]);
        if (value) {
            return value;
        }
        return fallback;
    };

    getEnvAsBoolean = (key: string, fallback: boolean): boolean => {
        const value: boolean = Boolean(process.env[key]);
        if (value) {
            return value;
        }
        return fallback;
    };
}
