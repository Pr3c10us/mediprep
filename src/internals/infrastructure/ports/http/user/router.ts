import {Router} from "express";
import {Services} from "../../../../app/services";
import {UserOnboardingHandler} from "./onboarding/handle";
import {ExamRouter} from "./exam/router";
import {AuthorizeUser} from "../../../../../pkg/middleware/authorization";
import {TestsHandler} from "./test/handler";
import {UserProfileHandler} from "./profile/handler";
import {CartHandler} from "./cart/handler";

export default class UserRouter {
    router: Router
    services: Services

    constructor(services: Services) {
        this.router = Router()
        this.services = services

        this.onboarding();
        this.exam();
        this.test();
        this.profile();
        this.cart();
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
}