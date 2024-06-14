import { Adapter } from "../infrastructure/adapters/adapters";
import { AdminServices } from "./admin/admin";
import { EmailServices } from "./email/email";
import {ExamServices} from "./exam/exam";

export class Services {
    AdminServices: AdminServices;
    EmailServices: EmailServices;
    ExamServices: ExamServices

    constructor(adapter: Adapter) {
        this.AdminServices = new AdminServices(
            adapter.AdminRepository,
            adapter.EmailQueueRepository
        );
        this.EmailServices = new EmailServices(adapter.EmailRepository);
        this.ExamServices = new ExamServices(adapter.ExamRepository,adapter.StorageRepository)
    }
}
