import { Record } from "../../../../domain/queue/producer";
import { EmailQueueRepository } from "../../../../domain/queue/repository";
import { Kafka, Producer, ProducerRecord } from "kafkajs";

export class EmailQueueRepositoryKafka implements EmailQueueRepository {
    producer: Producer;
    constructor(kafka: Kafka) {
        this.producer = kafka.producer();
    }
    Produce = async (record: Record) => {
        const kafkaProducerRecord: ProducerRecord = {
            topic: record.queue,
            messages: [
                {
                    value: record.message,
                },
            ],
        };

        try {
            await this.producer.connect();
            await this.producer.send(kafkaProducerRecord);
        } catch (error) {
            throw error;
        }
    };
}
