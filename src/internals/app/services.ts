import {Adapter} from "../infrastructure/adapters/adapters";
import {AdminServices} from "./admin/admin";
import {EmailServices} from "./email/email";
import {ExamServices} from "./exam/exam";
import {UserServices} from "./user/user";
import {SalesServices} from "./sale/sale";
import {UserExamAccessService} from "./examAccess/examAccess";
import {TestsServices} from "./test/test";
import {CartServices} from "./cart/cart";

export class Services {
    AdminServices: AdminServices;
    EmailServices: EmailServices;
    ExamServices: ExamServices;
    UserServices: UserServices
    SalesServices: SalesServices
    userExamAccessService: UserExamAccessService
    testServices: TestsServices
    CartServices: CartServices

    constructor(adapter: Adapter) {
        this.AdminServices = new AdminServices(
            adapter.AdminRepository,
            adapter.QueueRepository
        );
        this.EmailServices = new EmailServices(adapter.EmailRepository);
        this.ExamServices = new ExamServices(adapter.ExamRepository, adapter.StorageRepository, adapter.QueueRepository,adapter.testRepositories)
        this.UserServices = new UserServices(adapter.UserRepository, adapter.QueueRepository)
        this.SalesServices = new SalesServices(adapter.salesRepository, adapter.UserRepository, adapter.ExamRepository)
        this.userExamAccessService = new UserExamAccessService(adapter.userExamAccessRepository)
        this.testServices = new TestsServices(adapter.testRepositories)
        this.CartServices = new CartServices(adapter.cartRepositories)
    }
}
