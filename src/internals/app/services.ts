import { Adapter } from "../infrastructure/adapters/adapters";
import { AdminServices } from "./admin/admin";
import { EmailServices } from "./email/email";
import {ExamServices} from "./exam/exam";
import {UserServices} from "./user/user";
import {SalesServices} from "./sale/sale";
import {UserRepository} from "../domain/users/repository";
import {ExamRepository} from "../domain/exams/repository";

export class Services {
    AdminServices: AdminServices;
    EmailServices: EmailServices;
    ExamServices: ExamServices;
    UserServices: UserServices
    SalesServices: SalesServices

    constructor(adapter: Adapter) {
        this.AdminServices = new AdminServices(
            adapter.AdminRepository,
            adapter.QueueRepository
        );
        this.EmailServices = new EmailServices(adapter.EmailRepository);
        this.ExamServices = new ExamServices(adapter.ExamRepository,adapter.StorageRepository,adapter.QueueRepository)
        this.UserServices = new UserServices(adapter.UserRepository,adapter.QueueRepository)
        this.SalesServices = new SalesServices(adapter.salesRepository,adapter.UserRepository, adapter.ExamRepository)
    }
}
