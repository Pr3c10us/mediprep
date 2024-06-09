import { Consumer, Kafka } from "kafkajs";
import { EmailServices } from "../../../../app/email/email";
import { Email } from "../../../../domain/notification/email";
import { Environment } from "../../../../../pkg/configs/env";
import Logger from "../../../../../pkg/utils/logger";

export class EmailConsumer {
    environmentVariable: Environment;
    emailServices: EmailServices;
    consumer: Consumer;
    constructor(
        emailServices: EmailServices,
        kafka: Kafka,
        environmentVariable: Environment
    ) {
        this.environmentVariable = environmentVariable;
        this.emailServices = emailServices;
        this.consumer = kafka.consumer({
            groupId: environmentVariable.kafkaEmailGroupID,
        });
    }

    run = async () => {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topic: this.environmentVariable.kafkaEmailTopic,
            fromBeginning: true,
        });

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const data: Email = JSON.parse(String(message.value)) as Email;
                await this.sendMail(data);
            },
        });
    };

    sendMail = async (email: Email) => {
        try {
            await this.emailServices.Commands.sendMail.Handle(email);
            Logger.info("email sent successfully");
        } catch (error) {
            Logger.error("Failed to send Email");
            console.log(error);
        }
    };
}
