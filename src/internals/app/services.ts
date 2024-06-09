import { Adapter } from "../infrastructure/adapters/adapters";
import { AdminServices } from "./admin/admin";
import { EmailServices } from "./email/email";

export class Services {
    AdminServices: AdminServices;
    EmailServices: EmailServices;

    constructor(adapter: Adapter) {
        this.AdminServices = new AdminServices(
            adapter.AdminRepository,
            adapter.EmailQueueRepository
        );
        this.EmailServices = new EmailServices(adapter.EmailRepository);
    }
}
