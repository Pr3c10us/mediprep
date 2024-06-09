import { Record } from "./producer";

export interface EmailQueueRepository {
    Produce: (record: Record) => Promise<void>;
}
