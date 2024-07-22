import {Router} from "express";
import {AdminOnboardingHandler} from "./onboarding/handler";
import {ExamRouter} from "./exam/router";
import {AuthorizeAdmin} from "../../../../../pkg/middleware/authorization";
import {SalesHandler} from "./sales/handler";
import {Services} from "../../../../app/services";
import {UserOnboardingHandler} from "../user/onboarding/handle";
import {UserHandler} from "./user/handle";
import {TestsHandler} from "./test/handler";

export default class AdminRouter {
    router : Router
    services: Services
    constructor(services: Services) {
        this.router = Router()
        this.services = services

        this.onboarding();
        this.exam();
        this.sales();
        this.user();
    }

    onboarding = () => {
        const router = new AdminOnboardingHandler(this.services.AdminServices);
        this.router.use("/onboarding", router.router);
    };
    exam = () => {
        const router = new ExamRouter(this.services.ExamServices, this.services.AdminServices);
        this.router.use("/exam", AuthorizeAdmin(this.services.AdminServices.adminRepository), router.router);
    };

    sales = () => {
        const router = new SalesHandler(this.services.SalesServices);
        this.router.use("/sales", AuthorizeAdmin(this.services.AdminServices.adminRepository), router.router);
    };

    user = () => {
        const router = new UserHandler(this.services.UserServices,this.services.AdminServices);
        const testRouter = new TestsHandler(this.services.testServices,this.services.AdminServices)
        this.router.use("/user", router.router);
        this.router.use("/user/test", testRouter.router);
    };
}