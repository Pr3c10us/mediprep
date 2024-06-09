import { Email } from "./email";

export interface EmailRepository {
    SendMail: (email: Email) => Promise<void>;
}