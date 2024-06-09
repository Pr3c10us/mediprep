import "express-async-errors";
import { Services } from "./internals/app/services";
import { Adapter } from "./internals/infrastructure/adapters/adapters";
import { Server } from "./internals/infrastructure/ports/http/server";
import pg, { PoolClient } from "pg";
import { Environment } from "./pkg/configs/env";
import { Kafka, logLevel } from "kafkajs";
import { KafkaQueue } from "./internals/infrastructure/ports/kafka/queue";

const getDBClient = async (
    environmentVariables: Environment
): Promise<PoolClient> => {
    const { Pool } = pg;
    const pool = new Pool({
        user: environmentVariables.pgDBUsername,
        password: environmentVariables.pgDBPassword,
        host: environmentVariables.pgDBHost,
        port: environmentVariables.pgDBPort,
        database: environmentVariables.pgDBDatabase,
    });
    return await pool.connect();
};

const getKafka = async (environmentVariables: Environment): Promise<Kafka> => {
    const kafka = new Kafka({
        clientId: environmentVariables.kafkaClientId,
        brokers: environmentVariables.kafkaBroker,
        logLevel: logLevel.INFO,
        retry: {
            initialRetryTime: 100,
            retries: 8,
        },
    });
    const topics = [environmentVariables.kafkaEmailTopic];
    const admin = kafka.admin();
    admin.connect();
    const topicExists = await admin.listTopics();
    const upsertTopics = topics.map(async (topic) => {
        //   Check if topic exists and create it if it doesn't
        if (topicExists.includes(topic)) {
        } else {
            await admin.createTopics({
                topics: [
                    {
                        topic,
                    },
                ],
            });
        }
    });
    await Promise.all(upsertTopics);
    await admin.disconnect();
    return kafka;
};

const main = async () => {
    const environmentVariables = new Environment();
    const dbClient = await getDBClient(environmentVariables);
    const kafka = await getKafka(environmentVariables);

    const adapter: Adapter = new Adapter(dbClient, kafka, environmentVariables);
    const services: Services = new Services(adapter);
    const httpServer: Server = new Server(services, environmentVariables);
    const kafkaQueue: KafkaQueue = new KafkaQueue(
        kafka,
        services,
        environmentVariables
    );

    httpServer.listen();
    kafkaQueue.listen();
};

main();
