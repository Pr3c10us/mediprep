import { Kafka } from "kafkajs";
import { Services } from "../../../app/services";
import { Environment } from "../../../../pkg/configs/env";
import { EmailConsumer } from "./email/consumer";

export class KafkaQueue {
    kafka: Kafka;
    services: Services;
    environmentVariable: Environment;
    constructor(
        kafka: Kafka,
        services: Services,
        environmentVariable: Environment
    ) {
        this.kafka = kafka;
        this.services = services;
        this.environmentVariable = environmentVariable;
    }

    consumerEmailMessages = async () => {
        const emailConsumer = new EmailConsumer(
            this.services.EmailServices,
            this.kafka,
            this.environmentVariable
        );
        await emailConsumer.run();
    };

    listen = async () => {
        await this.consumerEmailMessages();
    };
}
