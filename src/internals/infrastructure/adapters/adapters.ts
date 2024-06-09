import { PoolClient } from "pg";
import { AdminRepository } from "../../domain/admins/repository";
import { AdminRepositoryPG } from "./persistence/posgresql/admin";
import { Environment } from "../../../pkg/configs/env";
import { EmailRepository } from "../../domain/notification/repository";
import { EmailRepositoryAzure } from "./notifications/azure/email";
import { EmailQueueRepository } from "../../domain/queue/repository";
import { EmailQueueRepositoryKafka } from "./queue/kafka/email";
import { Kafka } from "kafkajs";

export class Adapter {
    EnvironmentVariables: Environment;

    EmailQueueRepository: EmailQueueRepository;

    AdminRepository: AdminRepository;

    EmailRepository: EmailRepository;

    constructor(
        dbClient: PoolClient,
        kafka: Kafka,
        environmentVariables: Environment
    ) {
        this.EnvironmentVariables = environmentVariables;
        this.EmailQueueRepository = new EmailQueueRepositoryKafka(kafka);
        this.AdminRepository = new AdminRepositoryPG(dbClient);
        this.EmailRepository = new EmailRepositoryAzure(environmentVariables);
    }
}
