import {PoolClient} from "pg";
import {Environment} from "../../../pkg/configs/env";
import {EmailRepositoryAzure} from "./notifications/azure/email";
import {EmailQueueRepositoryKafka} from "./queue/kafka/email";
import {Kafka} from "kafkajs";
import {NodePgDatabase} from "drizzle-orm/node-postgres";
import {AdminRepositoryDrizzle} from "./persistence/database/drizzle/admin";
import {ExamRepositoryDrizzle} from "./persistence/database/drizzle/exam";
import {AzureStorageRepository} from "./persistence/storage/azure";
import {BlobServiceClient} from "@azure/storage-blob";
import {UserRepositoryDrizzle} from "./persistence/database/drizzle/user";
import {SalesRepositoryDrizzle} from "./persistence/database/drizzle/sale";

export class Adapter {
    EnvironmentVariables

    EmailQueueRepository

    EmailRepository


    StorageRepository

    AdminRepository

    ExamRepository

    UserRepository

    salesRepository


    constructor(
        dbClient: PoolClient,
        azureBlobClient: BlobServiceClient,
        kafka: Kafka,
        environmentVariables: Environment
    ) {
        this.EnvironmentVariables = environmentVariables;
        this.EmailQueueRepository = new EmailQueueRepositoryKafka(kafka);
        this.EmailRepository = new EmailRepositoryAzure(environmentVariables);
        this.StorageRepository = new AzureStorageRepository(azureBlobClient,environmentVariables)
        // this.AdminRepository = new AdminRepositoryPG(dbClient);
        this.AdminRepository = new AdminRepositoryDrizzle(dbClient)
        this.ExamRepository = new ExamRepositoryDrizzle(dbClient)
        this.UserRepository = new UserRepositoryDrizzle(dbClient)
        this.salesRepository = new SalesRepositoryDrizzle(dbClient)
    }
}
