import {Kafka} from "kafkajs";
import {Services} from "../../../app/services";
import {Environment} from "../../../../pkg/configs/env";
import {EmailConsumer} from "./email/consumer";
import {ExamQuestionFileConsumer} from "./examQuestionFile/consumer";
import {BlobServiceClient} from "@azure/storage-blob";

export class KafkaQueue {
    kafka: Kafka;
    services: Services;
    blobClient: BlobServiceClient;
    environmentVariable: Environment;

    constructor(
        kafka: Kafka,
        services: Services,
        blobClient: BlobServiceClient,
        environmentVariable: Environment
    ) {
        this.kafka = kafka;
        this.services = services;
        this.blobClient = blobClient
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

    consumerExamQuestionFileMessages = async () => {
        const consumer = new ExamQuestionFileConsumer(
            this.services.ExamServices,
            this.blobClient,
            this.kafka,
            this.environmentVariable
        );
        await consumer.run();
    };

    listen = async () => {
        await this.consumerEmailMessages();
        await this.consumerExamQuestionFileMessages()
        console.log("kafka listening")
    };
}
