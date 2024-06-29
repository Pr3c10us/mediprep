import { Environment } from "../../../pkg/configs/env";
import { Email } from "../notification/email";
import {ExamQuestionFile} from "../exams/exam";

export type Record = {
    queue: string;
    message: string;
};


export const newEmailQueueRecord = (email: Email): Record => {
    return {
        queue: new Environment().kafkaEmailTopic,
        message: JSON.stringify(email),
    };
};


export const newExamQuestionFileQueueRecord = (data : ExamQuestionFile): Record => {
    return {
        queue: new Environment().kafkaExamQuestionFileTopic,
        message: JSON.stringify(data),
    };
};