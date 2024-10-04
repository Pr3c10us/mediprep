import express, {Express, NextFunction, Request, Response, Router} from "express";
import {Services} from "../../../app/services";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {SuccessResponse} from "../../../../pkg/responses/success";
import Logger from "../../../../pkg/utils/logger";
import morganMiddleware from "../../../../pkg/middleware/morgan";
import {Environment} from "../../../../pkg/configs/env";
import ErrorHandlerMiddleware from "../../../../pkg/middleware/errorHandler";
import Route404 from "../../../../pkg/middleware/route404";
import {WebhookHandler} from "./webhook/handler";
import AdminRouter from "./admin/router";
import UserRouter from "./user/router";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import {User} from "../../../domain/users/user";
import {signToken} from "../../../../pkg/utils/encryption";
import {NotFoundError} from "../../../../pkg/errors/customError";
import {Adapter} from "../../adapters/adapters";

export class Server {
    adapters: Adapter
    services: Services;
    environmentVariables: Environment;
    port: number;
    server: Express;
    apiRouter: Router;


    constructor(adapters: Adapter, services: Services, environmentVariables: Environment,) {
        this.adapters = adapters
        this.services = services;
        this.environmentVariables = environmentVariables;
        this.port = environmentVariables.port;
        this.server = express();
        this.apiRouter = express.Router();

        this.initializePassport();


        this.server.use((req, res, next) => {
            if (req.originalUrl === "/api/v1/webhook/stripe") {
                express.raw({type: "application/json"})(req, res, next);
            } else {
                express.json()(req, res, next);
            }
        });
        // this.server.use(express.json());
        this.server.use(express.urlencoded({extended: false}));
        this.server.use(helmet());
        this.server.use(cookieParser(environmentVariables.cookieSecret));
        this.server.use(morganMiddleware);
        // this.server.use(
        //     cors({
        //         origin: environmentVariables.clientOrigin,
        //         credentials: true,
        //     })
        // );
        const cors = (req: Request, res: Response, next: NextFunction) => {
            const origin = req.headers.origin;
            if (origin) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Handle preflight requests
            if (req.method == "OPTIONS") {
                res.status(204)
                return
            }

            next();
        };

        // Use the CORS middleware
        this.server.use(cors);


        this.server.use(passport.initialize())
        this.server.get('/onboarding/google', passport.authenticate('google', {scope: ['profile', 'email']}));
        this.server.get('/onboarding/google/callback', (req, res, next) => {
            passport.authenticate('google', {session: false}, (err, user, info) => {
                if (err || !user) {
                    return res.redirect(this.environmentVariables.oauthFailureRedirect);
                }

                // const token = jwt.sign(user, this.jwtSecret, { expiresIn: '1h' });
                const payload = {id: user.id};
                const token = signToken(payload, false)
                res.cookie("userToken", token, {
                    signed: true,
                    maxAge: environmentVariables.cookieExpires,
                    httpOnly: false,
                }).redirect(`${this.environmentVariables.oauthSuccessRedirect}?token=${token}`);
            })(req, res, next);
        });

        this.health();
        this.webhook();
        this.user();
        this.admin();

        this.server.use(`/api/${environmentVariables.apiVersion}`, this.apiRouter);

        this.server.use(Route404);
        this.server.use(ErrorHandlerMiddleware);
    }

    health = () => {
        this.server.get("/health", (_: Request, res: Response) => {
            new SuccessResponse(res).send();
        });
    };

    webhook = () => {
        const router = new WebhookHandler(this.services.SalesServices, this.environmentVariables, this.adapters.StripeClient);
        this.apiRouter.use("/webhook", router.router);
    };

    user = () => {
        const router = new UserRouter(this.services);
        this.apiRouter.use("/user", router.router);
    };

    admin = () => {
        const router = new AdminRouter(this.services);
        this.apiRouter.use("/admin", router.router);
    };

    listen = () => {
        this.server.listen(this.port, () => {
            Logger.info(`Server running on ${this.environmentVariables.url}`);
        });
    };

    initializePassport = () => {
        passport.use(new GoogleStrategy({
            clientID: this.environmentVariables.googleClientId,
            clientSecret: this.environmentVariables.googleClientSecret,
            callbackURL: this.environmentVariables.googleCallbackUrl,
        }, this.verifyCallback));

        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user as any);
        });
    }

    verifyCallback = async (accessToken: string, refreshToken: string, profile: any, done: Function) => {
        console.log({profile})
        let user: User
        try {
            const userExist = await this.services.UserServices.userRepository.getUserByEmail(profile._json.email)
            user = userExist
        } catch (error) {
            if (error instanceof NotFoundError) {
                user = {
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    email: profile._json.email,
                    verified: true
                }
                const newUser = await this.services.UserServices.userRepository.addUser(user)
                user = newUser
            }
            throw error
        }
        // Save or use the user profile here
        done(null, user);
    }
}
