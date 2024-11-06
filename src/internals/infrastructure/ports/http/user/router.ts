import {Router} from "express";
import {Services} from "../../../../app/services";
import {UserOnboardingHandler} from "./onboarding/handle";
import {ExamRouter} from "./exam/router";
import {AuthorizeUser} from "../../../../../pkg/middleware/authorization";
import {TestsHandler} from "./test/handler";
import {UserProfileHandler} from "./profile/handler";
import {CartHandler} from "./cart/handler";
import {SalesHandler} from "./sales/handler";
import {UserSupportHandler} from "./support/handler";
import {Environment} from "../../../../../pkg/configs/env";

export default class UserRouter {
    router: Router
    services: Services
    environmentVariables

    constructor(services: Services, environmentVariables: Environment) {
        this.router = Router()
        this.services = services
        this.environmentVariables = environmentVariables

        this.onboarding();
        this.exam();
        this.test();
        this.profile();
        this.cart();
        this.sales();
        this.support()
    }

    onboarding = () => {
        const router = new UserOnboardingHandler(this.services.UserServices);
        this.router.use("/onboarding", router.router);
    };

    exam = () => {
        const router = new ExamRouter(this.services.ExamServices, this.services.AdminServices, this.services.userExamAccessService);
        this.router.use("/exam", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };

    test = () => {
        const router = new TestsHandler(this.services.testServices, this.services.userExamAccessService);
        this.router.use("/test", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };

    profile = () => {
        const router = new UserProfileHandler(this.services.UserServices);
        this.router.use("/profile", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };

    cart = () => {
        const router = new CartHandler(this.services.CartServices, this.services.SalesServices);
        this.router.use("/cart", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };

    sales = () => {
        const router = new SalesHandler(this.services.SalesServices);
        this.router.use("/sales", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };

    support = () => {
        const router = new UserSupportHandler(this.services.EmailServices, this.services.UserServices, this.environmentVariables);
        this.router.use("/support", AuthorizeUser(this.services.UserServices.userRepository), router.router);
    };
}