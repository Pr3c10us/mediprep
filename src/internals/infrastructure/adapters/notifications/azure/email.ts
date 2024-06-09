import {
    EmailAddress,
    EmailClient,
    EmailContent,
    EmailMessage,
    EmailSendResponse,
} from "@azure/communication-email";
import { EmailRepository } from "../../../../domain/notification/repository";
import { Environment } from "../../../../../pkg/configs/env";
import { Email } from "../../../../domain/notification/email";

export class EmailRepositoryAzure implements EmailRepository {
    Client: EmailClient;
    EnvironmentVariable: Environment;
    constructor(environmentVariables: Environment) {
        this.EnvironmentVariable = environmentVariables;
        this.Client = new EmailClient(
            environmentVariables.azCommunicationConnectionString
        );
    }

    SendMail = async (email: Email) => {
        let emailContent: EmailContent;
        if (email.plainText) {
            emailContent = {
                subject: email.subject,
                plainText: email.plainText,
            };
        } else if (email.html) {
            emailContent = {
                subject: email.subject,
                html: email.html,
            };
        } else {
            emailContent = {
                subject: email.subject,
                plainText: "",
            };
        }

        const emailAddresses: EmailAddress[] = email.mailTo.map((email) => {
            return { address: email };
        });

        const emailMessage: EmailMessage = {
            senderAddress: this.EnvironmentVariable.azCommunicationMailFrom,
            content: emailContent,
            recipients: {
                to: emailAddresses,
            },
        };

        try {
            const poller = await this.Client.beginSend(emailMessage);
            await poller.pollUntilDone();
        } catch (error) {
            throw error;
        }
    };
}
