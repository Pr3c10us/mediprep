import { Admin } from "../../internals/domain/admins/admin";

declare global {
    namespace Express {
        interface Request {
            admin?: Admin;
            signedCookies?: any;
        }
    }
}
