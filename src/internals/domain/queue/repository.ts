import { Record } from "./producer";

export interface QueueRepository {
    Produce: (record: Record) => Promise<void>;
}
