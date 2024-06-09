import { Environment } from "../../../pkg/configs/env";
import { Email } from "../notification/email";

export type Record = {
    queue: Topic;
    message: string;
};

type Topic = "email";

export const newEmailQueueRecord = (email: Email): Record => {
    return {
        queue: new Environment().kafkaEmailTopic as Topic,
        message: JSON.stringify(email),
    };
};
